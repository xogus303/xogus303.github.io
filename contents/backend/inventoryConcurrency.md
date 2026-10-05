---
startDate: '2026-10-05'
date: '2026-10-05'
series: 'Sunchak 개발기'
title: '재고 1개를 두고 30명이 동시에 달려들면 — 동시성 제어 5라운드'
categories: ['Backend']
tags: ['동시성', 'Redis', 'PostgreSQL', 'Concurrency']
thumbnail: '../../static/postThumbnails/postThumbnail_261005_inventoryConcurrency.png'
summary: '선착순 티켓 예매 서비스를 만들며, 재고 하나를 두고 벌어지는 동시 요청을 5가지 방법으로 막아보고 실측으로 겨뤄봤다'
---

Sunchak은 혼자 만든 선착순 티켓 예매 서비스입니다. 프론트엔드 개발자가 백엔드·인프라로 영역을 넓히면서, "일단 동작하게 만들기"보다 "왜 이렇게 만들어야 하는지 이해하기"를 목표로 시작한 사이드 프로젝트입니다. 모든 설계 선택은 ADR(Architecture Decision Record)로, 작업 과정은 DEVLOG로 남기며 진행했고, 이 시리즈는 그 기록 중 기술적으로 가장 흥미로웠던 지점들을 골라 다시 풀어쓴 것입니다.

> 선착순 예매 서비스를 혼자 만들면서 가장 먼저 부딪힌 벽은 "재고 하나를 여러 사람이 동시에 사려고 하면 무슨 일이 생기는가"였습니다. 정답을 바로 찾기보다, 가장 순진한 방법부터 하나씩 시도해보고 무엇이 왜 깨지는지 직접 겪어보기로 했습니다. 이 글은 그 다섯 라운드의 기록입니다.

### 상황 — 왜 "재고 하나"가 문제가 되는가

Sunchak은 공연 티켓을 선착순으로 파는 서비스입니다. 구조는 단순해요 — 이벤트마다 재고(`remainingQty`)가 있고, 예매 요청이 오면 재고를 1 줄이고 예약을 하나 만듭니다.

```
재고 확인 → 재고 1 줄이기 → 예약 기록 생성
```

문제는 **"선착순"이라는 말 자체가 이미 동시성 문제를 예고**한다는 겁니다. 티켓이 오픈되는 순간, 똑같은 재고 행(row) 하나를 수십·수백 명이 동시에 두드립니다. 이런 상황을 개발자들은 **hot row**(경합이 집중되는 행)라고 부릅니다.

재고가 1장 남았는데 30명이 동시에 "확인 → 차감"을 하면 어떻게 될까요? 다섯 가지 방법으로 직접 재현해봤습니다.

### 측정 방법

k6로 부하를 걸고, 재고 20만(도중 매진으로 측정이 끊기지 않도록 넉넉하게 잡음)에 동시 요청 30개를 15초간 쏟아부었습니다. 같은 이벤트 하나의 재고 행에 전부 몰리게 만들어 "선착순 오픈 순간"을 흉내냈습니다.

| 항목 | 값 |
|---|---|
| 도구 | k6 |
| 동시 요청(VU) | 30 |
| 지속 시간 | 15초 |
| 재고 | 200,000 |
| 비교 기준 | 같은 재고 행에 전 요청이 경합 |

### 1라운드 — 순진한 구현 (naive)

가장 먼저 떠오르는 방법대로 짰습니다. 읽고, 확인하고, 써넣습니다.

```ts
const inventory = await prisma.inventory.findUnique({ where: { eventId } })
if (inventory.remainingQty < quantity) throw new ConflictException('재고가 부족합니다.')

await prisma.inventory.update({
  where: { id: inventory.id },
  data: { remainingQty: inventory.remainingQty - quantity },
})
await prisma.reservation.create({ data: { userId, eventId, quantity } })
```

결과:

| RPS | 성공 응답 | 실제 차감된 수 | 정확성 |
|---|---|---|---|
| 2338 | 35,091건 | **1,441건** | ❌ |

응답은 35,091건이 성공했다고 왔는데, 실제로 재고에서 빠진 건 1,441건뿐이었습니다. **나머지 33,650건은 어디로 갔을까요?**

범인은 "읽기"와 "쓰기" 사이의 틈입니다. A와 B가 동시에 재고를 읽으면 둘 다 "100개 남았다"고 봅니다. A가 "99개"로 씁니다. 그런데 B도 자기가 읽은 "100개" 기준으로 "99개"를 씁니다. **A의 차감이 통째로 사라집니다.** 이걸 **lost update**(갱신 손실)라고 부릅니다.

더 섬뜩한 건, 이게 **에러를 내지 않는다**는 점입니다. 재고 카운터는 음수로 떨어지지도 않고, 그냥 조용히 "적게 깎인 정상적인 숫자"처럼 보입니다. 모니터링 화면은 아무 이상 없어 보이는데, 실제로는 없는 좌석을 수만 건 팔아버린 상태인 거죠. **계기판이 정상이라고 거짓말하는 버그가 왜 더 위험한지** 여기서 처음 체감했습니다.

### 2라운드 — 비관적 락 (Pessimistic Lock)

"그럼 아예 못 건드리게 잠가버리자"는 생각으로 두 번째 방법을 시도했습니다.

```ts
await prisma.$transaction(async tx => {
  const [inventory] = await tx.$queryRaw`
    SELECT id, "remainingQty" FROM inventories WHERE "eventId" = ${eventId} FOR UPDATE
  `
  if (inventory.remainingQty < quantity) throw new ConflictException('재고가 부족합니다.')
  await tx.inventory.update({ where: { id: inventory.id }, data: { remainingQty: inventory.remainingQty - quantity } })
  await tx.reservation.create({ data: { userId, eventId, quantity } })
})
```

`FOR UPDATE`는 "이 행, 내가 다 쓸 때까지 아무도 못 건드려"라고 선언하는 겁니다. 트랜잭션이 끝날 때까지 다른 요청은 줄을 서서 기다립니다.

| RPS | 정확성 | p95 |
|---|---|---|
| 1126 | ✅ 정확 | 67.9ms |

**정확했습니다.** 그런데 naive보다 느려졌어요(RPS 절반 이하, p95는 2배). 당연합니다 — "줄 세우기"를 선택한 순간, 동시에 처리되던 걸 하나씩 순서대로 처리하는 것으로 바꾼 거니까요. **정확성을 산 대가는 대기 시간**이었습니다.

### 3라운드 — 낙관적 락 (Optimistic Lock)

"어차피 충돌은 드물 테니, 잠그지 말고 쓰다가 충돌하면 그때 재시도하자"는 접근입니다. `version`이라는 숫자 컬럼을 두고, 쓸 때마다 "내가 읽었던 버전이 아직 유효한가"를 같이 확인합니다.

```ts
for (let i = 0; i < MAX_RETRIES; i++) {
  const inventory = await prisma.inventory.findUnique({ where: { eventId } })
  const updated = await prisma.inventory.updateMany({
    where: { id: inventory.id, version: inventory.version },
    data: { remainingQty: inventory.remainingQty - quantity, version: { increment: 1 } },
  })
  if (updated.count > 0) break // 성공
  // count === 0이면 그 사이 다른 요청이 먼저 썼다는 뜻 — 재시도
}
```

| RPS | 성공 | 실패(재시도 소진) | 정확성 |
|---|---|---|---|
| 859 | 12,902건 | **8,262건** | ⚠️ |

정확하긴 했지만(성공한 것들은 전부 제대로 반영됨), **8,262건이 "재시도 5번을 다 썼는데도 못 들어가서" 실패**했습니다. 재고가 20만 개나 남아있었는데도요! 30명이 같은 행에 동시에 CAS(compare-and-swap)를 던지니, 대부분이 서로의 버전을 덮어쓰며 경쟁에서 밀렸습니다. **경합이 "드물 때"를 가정한 전략을, 경합이 "극심한" 상황(바로 이 프로젝트가 재현하려던 그 상황)에 썼더니 역효과가 난 겁니다.**

### 4라운드 — DB 원자 연산 (Atomic UPDATE)

"확인"과 "차감"을 아예 한 문장으로 묶어버리면 어떨까요?

```sql
UPDATE inventories
SET "remainingQty" = "remainingQty" - ${quantity}
WHERE "eventId" = ${eventId} AND "remainingQty" >= ${quantity}
```

이 한 줄이 핵심입니다. "재고가 충분한지 확인"과 "차감"이 **하나의 SQL 문** 안에 있어서, 둘 사이에 다른 요청이 끼어들 틈이 없습니다. 영향받은 행이 0개면 재고 부족, 1개면 성공.

| RPS | 정확성 | p95 |
|---|---|---|
| 2024 | ✅ 정확 | 41.8ms |

naive의 속도(2338)에 거의 근접하면서(2024, naive 대비 87%), **정확성까지 완벽하게 챙겼습니다.** 인프라도 추가로 필요 없고요. 이 시점에서 "이게 답 아닌가?" 싶었습니다.

### 5라운드 — Redis 원자 연산

그런데 하나 더 시도해봤습니다. 재고 차감 자체를 Postgres가 아니라 **Redis**로 옮기면 어떨까요?

```ts
const remaining = await redis.decrby(`stock:event:${eventId}`, quantity)
if (remaining < 0) {
  await redis.incrby(`stock:event:${eventId}`, quantity) // 되돌리기
  throw new ConflictException('재고가 부족합니다.')
}
await prisma.reservation.create({ data: { userId, eventId, quantity } })
```

`DECRBY`는 Redis에 원래 있는 "숫자를 원자적으로 뺀다"는 명령입니다. Redis는 명령을 처리하는 핵심 스레드가 하나뿐이라서(이게 왜 느리지 않은지는 아래에서 설명합니다), 여러 요청이 동시에 `DECRBY`를 불러도 **절대 같은 순간에 같은 값을 깎지 못합니다.**

| RPS | 정확성 | p95 |
|---|---|---|
| **9354** | ✅ 정확 | **4.4ms** |

**atomic 대비 4.6배, p95는 1/10 수준.** 압도적이었습니다.

#### 왜 이렇게 차이가 날까

4라운드(atomic)와 5라운드(redis) 둘 다 "같은 카운터를 한 줄로 세워 처리한다"는 원리는 똑같습니다. 그런데도 이만큼 차이가 나는 이유는 **줄 하나를 처리하는 비용** 자체가 다르기 때문입니다.

Postgres의 `UPDATE`는 단순해 보여도 뒤에서 **행 락**을 잡고, **MVCC**(여러 트랜잭션이 동시에 봐도 서로 다른 시점의 데이터를 보게 해주는 장치)를 위해 새 버전의 행을 만들고, 장애 복구를 위한 **WAL**(쓰기 전에 먼저 남기는 로그)까지 기록합니다. 디스크를 거치는 작업이에요.

Redis의 `DECRBY`는 메모리에 있는 정수 하나를 그냥 뺍니다. 디스크도, MVCC도, WAL도 없습니다. **같은 "한 줄로 세우기"라도, 그 줄이 빠지는 속도 자체가 자릿수로 다릅니다.**

### 전체 성적표

| 전략 | RPS | p95(ms) | 정확성 |
|---|---|---|---|
| naive | 2338 | 33.6 | ❌ (1,441/35,091만 반영) |
| pessimistic | 1126 | 67.9 | ✅ |
| optimistic | 859 | 61.9 | ⚠️ (8,262건 재시도 소진) |
| atomic | 2024 | 41.8 | ✅ |
| **redis** | **9354** | **4.4** | ✅ |

```
정확성 없는 속도는 무의미          → naive 탈락
hot row 고경합 상황의 처리량:
   redis  >>  atomic  >  pessimistic  >  optimistic
```

### 그래서 무엇을 골랐나

**Redis 원자 차감**을 재고의 1차 관문으로 삼기로 했습니다. 다만 공짜는 아닙니다 — 재고의 "진짜 값"이 이제 Postgres가 아니라 Redis에만 있다는 뜻이거든요. Redis가 죽으면? Postgres와 값이 어긋나면 어떻게 맞출까요? 이 질문에 대한 답(그리고 거기서 또 발견한 버그 하나)은 다음 편에서 다룹니다.

인프라 추가 없이 가고 싶다면 **4라운드의 atomic UPDATE가 합리적인 차선**입니다. 낙관적 락은 경합이 드문 상황에서나 쓸 만하고, 비관적 락은 "확실한 순서 보장"이 재고 속도보다 더 중요할 때의 안전판입니다.

### 번외 — Redis는 "한 번에 하나씩"인데 왜 가장 빠를까

5라운드 결과를 보면 궁금증이 하나 남습니다 — Redis는 명령을 처리하는 핵심 스레드가 **딱 하나**입니다. 여러 요청이 와도 한 번에 하나씩만 처리해요. "그럼 여러 스레드가 나눠 처리하는 게 더 빠르지 않을까?"라고 생각할 수 있는데, 실제로는 그 반대였습니다.

여러 스레드가 같은 데이터를 동시에 건드리려면, "지금 누가 쓰고 있는지"를 서로 조율하는 락(lock) 장치가 필요합니다. 이 조율 자체에 비용이 듭니다. Redis는 애초에 스레드가 하나뿐이라 **이 조율 비용 자체가 발생하지 않습니다.**

비유하면 이렇습니다 — 계산이 아주 빠른 계산원 한 명이 줄을 처리하는 것과, 계산원 여러 명이 "같은 금고를 서로 안 건드리게" 매번 신호를 주고받으며 처리하는 것. 각 계산(명령) 자체가 메모리 연산 하나로 충분히 가벼우면, 계산원 한 명이 오히려 더 빠를 수 있습니다. 조율할 상대가 없으니까요.

그리고 **"한 번에 하나씩 처리한다"는 성질 자체가 바로 이 프로젝트가 `DECRBY`를 안전한 관문으로 믿고 쓸 수 있는 이유**이기도 합니다. 별도의 락 코드를 한 줄도 안 짰는데, Redis의 처리 방식 자체가 곧 락 역할을 해준 셈입니다.

실제로 로컬 벤치마크에서 Redis 원자 연산은 초당 9,354건을 처리했습니다 — "한 번에 하나씩"이 느려진다는 직관과 달리, 각 연산이 충분히 가벼우면 전혀 병목이 아니라는 걸 숫자로도 확인했습니다.

> 다섯 전략을 전부 직접 돌려보고, Redis가 왜 그렇게 빠른지까지 뜯어보고 나서야 "단일 카운터의 직렬화 비용"이라는 말이 완전히 체감으로 이해됐습니다. 빠르다는 결과만 보고 넘어갔다면 몰랐을 것들이었습니다.

## 참고자료

- [Sunchak 프로젝트 — 동시성 설계 결정(ADR 0014)](https://github.com/xogus303/Sunchak/blob/bd349dcbff15846d02132d9619d4580b670faa40/docs/decisions/0014-reservation-strategy.md)
- [PostgreSQL 공식 문서 — MVCC](https://www.postgresql.org/docs/current/mvcc-intro.html)
- [Redis 공식 문서 — 단일 스레드 여부(Is Redis single-threaded?)](https://redis.io/tutorials/what-is-redis/)
