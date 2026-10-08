---
startDate: '2026-10-08'
date: '2026-10-08'
series: 'Sunchak 개발기'
title: 'sweep은 "결제 시도 중"을 어떻게 판단할까'
categories: ['Backend']
tags: ['TTL', 'PostgreSQL', '동시성', 'Concurrency']
thumbnail: '../../static/postThumbnails/postThumbnail_261008_sweepTwoTierTtl.png'
summary: '벽시계 TTL만 보던 회수 로직이 결제 처리 중인 예약까지 지워버리던 문제를, 결제 시도 여부로 나눈 이단계 TTL로 해결한 과정'
---

> 3편에서 HELD(결제도 확정도 아직 안 된 임시 확보 상태)가 왜 필요한지 봤습니다. HELD는 영원히 머물 수 없습니다 — 결제를 시도조차 안 하고 이탈한 사람의 자리는 돌려줘야 하니까요. 그 역할을 하는 게 **sweep**(방치된 HELD를 주기적으로 청소하는 작업)입니다. 이번 편은 이 sweep이 "방치"와 "지금 결제 처리 중"을 구분하지 못해 생긴 문제와, 그걸 고친 과정의 기록입니다.

### HELD에는 자동 만료가 필요하다

관문을 통과해 HELD로 기록된 예약에는 30초짜리 TTL(`heldUntil`)이 걸려 있습니다. 결제를 시도하지 않고 페이지를 닫아버리는 사람은 분명히 있고, 그 자리를 영원히 붙잡아두면 다른 사람이 살 수 있었던 좌석이 조용히 사라지는 셈이니까요.

이 TTL을 확인하고 회수하는 워커가 sweep입니다. 5초마다(`SWEEP_INTERVAL_MS`) 돌면서, `heldUntil`이 지난 HELD 예약을 찾아 `EXPIRED`로 바꾸고 재고를 돌려줍니다.

```sql
UPDATE reservations
SET status = 'EXPIRED', "updatedAt" = now()
WHERE status = 'HELD' AND "heldUntil" < now()
RETURNING id, "eventId", quantity
```

"대상을 찾고 나서 바꾸자"(SELECT 후 UPDATE)로 나누지 않고 `UPDATE...RETURNING` 한 문장으로 묶은 이유도 있습니다 — 둘로 나누면 그 틈에 confirm 워커가 같은 행을 먼저 가져갈 수 있는데, `WHERE status='HELD'` 조건이 포함된 한 문장이면 그 경합 자체가 들어설 자리가 없습니다.

### 벽시계만 보는 TTL의 함정

문제는 이 TTL이 **벽시계 시간만** 본다는 점입니다. 2편에서 다룬 백프레셔(입장 허가가 결제 처리량에 맞춰 스스로 느려지는 장치)를 적용한 뒤, 재고 5,000·VU 3,000 규모로 재현해보니 `Payment PAID` 건수와 `Reservation CONFIRMED` 건수가 정확히 일치하지 않는 **정합성 불일치(divergence)**가 74건 남아있었습니다. 백프레셔 적용 전엔 1,199건이었으니 94% 줄어든 건데, 0은 아니었습니다.

원인을 추적해보니, 결제 판정 워커(`payment.processor.ts`)는 "지금 이 순간 HELD인지"만 확인하고 확정 큐에 job을 넣는데, **그 job이 실제로 처리되기까지 기다리는 동안**에도 sweep은 여전히 `heldUntil`만 보고 회수할 수 있었습니다. 결제가 성공해서 확정 큐에 job까지 들어간 예약인데, 그 job이 처리되기 전에 TTL이 먼저 지나버리면 sweep이 멀쩡히 "진행 중"인 예약을 "방치"로 오인해 회수해버리는 겁니다. 같은 종류의 경합이 결제 큐 경계에서 확정 큐 경계로 자리만 옮겨, 규모만 작아진 채 남아있었던 셈입니다.

### "결제 시도가 있었는가"로 나눈 이단계 판단

필요한 건 "시간이 얼마나 지났는가"가 아니라 **"이 사람이 결제를 시도라도 했는가"**였습니다. 결제를 시도하면 그 순간 `Payment` 행이 하나 생기므로, 이 행의 존재 여부로 둘을 가를 수 있습니다.

```sql
UPDATE reservations
SET status = 'EXPIRED', "updatedAt" = now()
WHERE status = 'HELD' AND (
  (
    "heldUntil" < now()
    AND NOT EXISTS (SELECT 1 FROM payments WHERE payments."reservationId" = reservations.id)
  )
  OR "createdAt" < ${paymentFallbackThreshold}
)
RETURNING id, "eventId", quantity
```

하나의 `WHERE` 절 안에 두 가지 기준이 `OR`로 묶여 있습니다.

<aside class="post-aside"><ol>
<li><strong>결제 시도가 없는 HELD</strong> — <code>NOT EXISTS(SELECT 1 FROM payments ...)</code>로 확인합니다. 결제 버튼도 안 누르고 이탈한 "진짜 방치"이므로, 기존의 촘촘한 30초 TTL(<code>heldUntil</code>)을 그대로 적용합니다.</li>
<li><strong>결제 시도가 있는 HELD</strong> — 30초 TTL에서 완전히 제외합니다. 결제/확정 큐가 아무리 밀려도 언젠가는 스스로 PAID→CONFIRMED나 FAILED→CANCELLED로 매듭짓게 맡깁니다. 대신 "결제 job 자체가 영영 안 끝나는" 진짜 장애만 잡는, 훨씬 관대한 안전망(<code>createdAt</code> 기준 5분)을 별도로 둡니다.</li>
</ol></aside>

두 기준을 **별도의 두 쿼리**로 나누지 않고 하나의 `UPDATE...RETURNING` 안에 `OR`로 합친 이유도 같습니다 — 쿼리를 둘로 쪼개면 그 사이에 또 다른 경합이 끼어들 틈이 생기는데, 하나의 원자적 문장이면 그럴 일이 없습니다.

30초와 5분이라는 두 숫자도 성격이 다릅니다. 30초는 "사람이 결제 버튼을 안 누르면 포기한 것으로 본다"는 **사용자 행동에 대한 판단**이고, 5분은 "결제 처리 자체가 멈췄다면 뭔가 고장난 것"이라는 **시스템 장애에 대한 안전망**입니다. 같은 "TTL"이라는 이름 아래 있지만 재는 대상이 전혀 다릅니다.

이 수정을 배포하고 같은 3,000 VU 규모로 재현한 결과, divergence는 **정확히 0**이 됐습니다.

> 1,199건 → (백프레셔) → 74건 → (sweep 이단계화) → 0건. 숫자가 0에 가까워질수록 남은 원인은 점점 더 찾기 어려워졌습니다 — 마지막 74건은 "결제 큐 경계"에서 "확정 큐 경계"로 옮겨간, 똑같은 모양이지만 훨씬 작아진 경합이었습니다. 문제가 완전히 다른 곳에 숨은 게 아니라 같은 패턴이 작은 규모로 반복되고 있었다는 걸 알아챈 게 이번 수정의 핵심이었습니다.

## 참고자료

- [Sunchak 프로젝트 — 백프레셔 설계 결정(ADR 0023)](https://github.com/xogus303/Sunchak/blob/bd349dcbff15846d02132d9619d4580b670faa40/docs/decisions/0023-load-test-admission-backpressure.md)
- [PostgreSQL 공식 문서 — 서브쿼리 표현식(EXISTS)](https://www.postgresql.org/docs/current/functions-subquery.html)
