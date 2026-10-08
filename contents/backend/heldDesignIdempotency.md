---
startDate: '2026-10-06'
date: '2026-10-06'
series: 'Sunchak 개발기'
title: '결제 전에 "확정"을 쓰지 않은 이유 — HELD 설계, 뒤집힌 멱등키, CTE로 줄인 왕복'
categories: ['Backend']
tags: ['멱등성', 'PostgreSQL', 'BullMQ']
thumbnail: '../../static/postThumbnails/postThumbnail_261006_heldDesignIdempotency.png'
summary: '관문을 통과해도 바로 확정하지 않고 HELD를 거치는 이유, 구현 직전에 뒤집힌 멱등성 키 설계, 결제 워커의 DB 왕복을 3번에서 1번으로 줄인 CTE 기법'
---

> 1편에서 재고 관문을, 2편에서 입장 대기열을 봤습니다. 이 둘을 통과한 사람에게 무슨 일이 일어나는지는 아직 다루지 않았습니다 — 2편에서 HELD가 "결제도 확정도 아직 안 된 임시 확보 상태"라고 잠깐 짚고 넘어갔는데, 이번 편은 그 설계 자체가 왜 이런 모양이 됐는지, 설계를 짜다가 구현 직전에 뒤집힌 부분 하나, 그리고 그 설계를 실제로 빠르게 만든 기법 하나를 다룹니다.

### HELD 하나로 시작된 설계 사슬

재고 관문(1편)을 통과하면 바로 "확정"으로 끝내도 될 것 같지만, 그 순간 세 가지 문제가 한꺼번에 남습니다.

1. **Redis와 DB가 어긋날 수 있음**: 관문에서 재고는 이미 깎였는데(Redis), 그 직후 실제 예매 기록을 DB에 쓰는 게 실패하면 좌석 하나가 그냥 증발합니다.
2. **Redis가 죽으면 재고를 어떻게 복구하나**: Redis는 메모리에 있는 휘발성 저장소라, 서버가 죽으면 재고 카운터가 통째로 날아갑니다.
3. **같은 요청이 두 번 오면**: 응답을 못 받은 클라이언트가 재전송하거나 사용자가 버튼을 두 번 누르면, 서버는 이게 "재전송"인지 "진짜 한 장 더 사려는 것"인지 요청만 보고 구분할 수 없습니다.

고민한 선택지는 이랬습니다.

- **관문 통과 즉시 동기로 DB까지 다 쓰고 확정 응답** — 가장 단순하지만, 사용자가 DB 완료까지 기다려야 하고(느림) DB 쓰기가 실패하면 그대로 유실됩니다.
- **Redis·큐에만 "진행 중" 상태를 두고 DB엔 확정된 것만 기록** — 응답은 빠르지만, Redis가 유실되면 "확정 전 상태"였던 주문들을 셀 방법이 없어 재고를 정확히 복구할 수 없습니다.

최종적으로 고른 건 **HELD 선(先)기록 + 비동기 확정**입니다.

<aside class="post-aside"><ol>
<li><strong>관문</strong> — Redis <code>DECRBY</code>로 초과판매를 막습니다.</li>
<li><strong>HELD 선기록</strong> — DB에 <code>status=HELD</code>로 씁니다. 아직 확정 전이지만, DB엔 이미 흔적이 남습니다.</li>
<li><strong>큐잉</strong> — BullMQ에 job을 투입합니다.</li>
<li><strong>즉시 응답</strong> — "접수됨(HELD)"을 바로 돌려줘, 사용자 응답과 DB 확정을 분리합니다.</li>
<li>워커가 HELD를 <strong>CONFIRMED</strong>로 갱신하고, SSE로 확정을 통보합니다.</li>
</ol></aside>

**왜 DB에 먼저 남기는가** — HELD가 DB에 없으면, Redis가 죽었을 때 "확정 전이지만 이미 재고를 차지한 주문"들을 셀 수 없습니다. 처음부터 DB에 흔적을 남겨야 `남은 재고 = 총재고 − (HELD + CONFIRMED)`로 정확히 복구됩니다.

**왜 비동기인가** — 사용자는 DB 쓰기 완료를 기다릴 필요 없이 바로 응답을 받고, 그사이 워커가 실패해도 큐가 재시도해 결국은 기록됩니다(최종 일관성). 대신 "접수됨"과 "확정" 사이에 시차가 생기니, 그 틈을 SSE로 메웁니다.

**결제가 설령 실패 없이 항상 성공한다고 해도, HELD 같은 중간 상태는 여전히 필요합니다.** 결제가 큐를 거쳐 비동기로 처리되는 한(③), "결제하기"를 누른 시점과 실제 처리가 끝나는 시점 사이엔 어차피 시간차가 생깁니다. 그 시간 동안 사용자를 기다리게 하지 않고 바로 응답하려면(④), 시스템은 "지금 처리 중"이라는 상태를 어딘가에 표현하고 있어야 합니다 — 실패 가능성과는 별개로, **비동기로 빠르게 응답한다는 설계 자체가 이미 중간 상태를 요구하는 것**입니다.

이 하나의 결정(HELD라는 "중간 상태"를 만든 것)이 이후 계속 따라붙습니다 — HELD가 영원히 안 끝나면 자리를 영구히 차지하니 TTL과 sweep이 필요해졌고, HELD·결제 기록을 한꺼번에 지워야 하는 상황(재고 리셋)이 생기니 FK cascade가 필요해졌고, 그 리셋 자체가 반복되는 상황(재진입)에서는 세대 카운터가 필요해졌습니다.

전부 2편에서 이미 보신 장치들이, 사실은 "HELD라는 상태를 만들었다"는 이 결정 하나에서 갈라져 나온 겁니다.

### "멱등성 키는 누가 만들어야 하나" — 구현 직전에 뒤집힌 설계

중복 방지를 위해 "멱등성 키"(같은 요청인지 구분하는 식별자)를 쓰기로 했는데, 최초 설계안은 이렇습니다:

> API 서버가 멱등성 키를 발급한다. 그 키에 건 unique 제약이, 워커가 재시도할 때 생기는 중복 INSERT를 막아준다.

구현을 시작하기 직전 검토 단계에서, 이 문장이 **둘 다 틀렸다**는 걸 깨달았습니다.

첫째, 이 파이프라인에서 INSERT(새 행 생성)는 요청 경로(②)에서 **딱 한 번**만 일어납니다. 워커(⑤)는 `WHERE status='HELD'`로 기존 행을 UPDATE할 뿐, INSERT를 하지 않습니다. 워커가 재시도돼도 "두 번째 INSERT"라는 게 애초에 발생하지 않으니, unique 제약이 막아줄 대상 자체가 없었던 겁니다.

둘째, **서버가 키를 발급하면 요청마다 새 키가 나옵니다.** 사용자가 버튼을 두 번 눌러도 서버 입장에선 "키가 다른 두 개의 요청"일 뿐이라 같은 요청인지 구분할 수 없습니다 — 그건 멱등성 키가 아니라 그냥 PK(기본키)입니다.

바로잡은 설계는 **클라이언트가 요청마다 UUID를 만들어** 보내고, 재전송할 땐 **같은 키를 그대로 유지**하는 것입니다. "이게 재전송인지 새 주문인지"는 재전송을 실행하는 클라이언트만 알 수 있으니, 그 판정 권한 자체를 클라이언트에 맡기는 구조입니다. DB에는 이 키에 `unique` 제약을 걸어, 재전송의 INSERT를 DB가 원자적으로 거부하게 합니다.

다만 이것만으론 끝나지 않습니다 — 관문(① Redis DECRBY)이 INSERT(②)보다 먼저 실행되기 때문에, 재전송도 재고를 한 번 더 깎고 나서야 unique 제약에 걸립니다. 그대로 두면 "주문 없이 재고만 사라지는" 상황이 됩니다. 그래서 unique 위반이 나면 `INCRBY`로 방금 깎은 만큼 되돌리고, 에러 대신 **첫 요청과 똑같은 결과(같은 예매 ID)**를 응답합니다 — "몇 번을 호출하든 결과가 같다"가 멱등성의 정의이기 때문입니다.

한 줄도 구현하지 않은 상태에서 설계 문서를 다시 읽다가 "이 unique 제약이 실제로 막는 게 뭐지?"라고 스스로 되물은 게 전부였는데, 그 질문 하나가 설계 전체의 전제(서버 발급 키)를 뒤집었습니다.

### 결제 job의 DB 왕복을 3번에서 1번으로 줄인 CTE

결제 판정 워커(`payment.processor.ts`)는 원래 이렇게 짜여 있었습니다 — "HELD 상태인지 재확인"하고, 그 결과에 따라 "Payment 상태를 갱신"하는 걸 **순차적인 별도 DB 호출 2~3번**으로 나눠 했습니다.

이 프로젝트가 쓰는 원격 DB(Neon)는 왕복 1번에 약 100ms가 걸려서, job 하나 처리하는 데 250~300ms가 들었고 — 동시 처리 개수(concurrency)를 아무리 올려도 전체 처리량은 실측 **초당 약 70건**에 머물렀습니다.

해법은 "확인"과 "갱신"을 **한 번의 SQL 문**으로 묶는 것이었습니다. 성공(결제 완료) 분기는 이렇게 바뀌었습니다.

```sql
UPDATE payments
SET status = CASE WHEN r.status = 'HELD' THEN 'PAID'::"PaymentStatus" ELSE 'FAILED'::"PaymentStatus" END,
  "updatedAt" = now()
FROM reservations r
WHERE payments.id = ${paymentId} AND payments."reservationId" = r.id
RETURNING (r.status = 'HELD') AS "wasHeld"
```

`UPDATE ... FROM ... RETURNING`으로 "예약이 지금도 HELD인지 확인"과 "그 결과에 따라 Payment 갱신"을 한 문장에 담아, 왕복 2번을 1번으로 줄였습니다.

실패(결제 거절) 분기는 세 단계(예약 취소 → Payment 갱신 → 반환할 수량 조회)가 필요해서 조금 더 복잡합니다. 여기서 쓴 게 **CTE**(Common Table Expression) — `WITH 이름 AS (...)`로 쿼리 중간 결과에 임시 이름을 붙여, 뒤따르는 문장에서 그 이름으로 다시 참조할 수 있게 해주는 SQL 문법입니다.

```sql
WITH cancelled AS (
  UPDATE reservations
  SET status = 'CANCELLED', "updatedAt" = now()
  WHERE id = ${reservationId} AND status = 'HELD'
  RETURNING "eventId", quantity
)
UPDATE payments
SET status = 'FAILED', "updatedAt" = now()
WHERE id = ${paymentId}
RETURNING
  (SELECT "eventId" FROM cancelled) AS "eventId",
  (SELECT quantity FROM cancelled) AS quantity
```

`cancelled`라는 이름으로 "예약을 취소하면서 반환된 행"을 임시로 들고 있다가, 바로 다음 `UPDATE payments` 문에서 그 값을 서브쿼리로 꺼내 씁니다. 세 번 왕복할 걸 한 번에 묶은 겁니다(Prisma의 `updateMany`는 `RETURNING`을 지원하지 않아, 이런 경우엔 raw SQL이 필요합니다).

job당 250~300ms이던 처리 시간이 왕복 1번(약 100ms) 수준으로 줄면서, 이론상 처리량이 2배(초당 약 70→140건)로 늘어날 걸로 예상했고 — 실제로 이 최적화가 2편에서 실측했던 결제 파이프라인 처리량(130/초)의 바탕이 됐습니다.

> 세 가지 다 "되는 코드"를 "제대로 된 코드"로 바꾼 이야기입니다 — HELD는 문제를 피하지 않고 중간 상태로 끌어안는 선택이었고, 멱등성 키는 구현 전에 스스로에게 던진 질문 하나가 설계를 뒤집은 경우였고, CTE는 느린 이유를 각 왕복 단위까지 쪼개본 뒤에야 보인 해법이었습니다.

## 참고자료

- [Sunchak 프로젝트 — 예매 정합성 설계(ADR 0015)](https://github.com/xogus303/Sunchak/blob/bd349dcbff15846d02132d9619d4580b670faa40/docs/decisions/0015-reservation-consistency-design.md)
- [PostgreSQL 공식 문서 — WITH 쿼리(CTE)](https://www.postgresql.org/docs/current/queries-with.html)
- [Stripe 공식 문서 — Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
