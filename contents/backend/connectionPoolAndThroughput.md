---
startDate: '2026-10-09'
date: '2026-10-09'
series: 'Sunchak 개발기'
title: '커넥션 풀의 보이지 않는 잠금 — 성능 버그 3건을 실측으로 추적하다'
categories: ['Backend']
tags: ['PostgreSQL', 'BullMQ', '성능', 'Concurrency']
thumbnail: '../../static/postThumbnails/postThumbnail_261009_connectionPoolAndThroughput.png'
summary: 'idle in transaction으로 묶인 커넥션 풀, BullMQ concurrency 기본값 1, 처리량을 순감소로 착각한 측정 오류 — 세 가지 성능 버그를 실측으로 추적한 기록'
---

> 4편에서 "시간만 보는 판단"이 어떻게 틀릴 수 있는지 봤습니다. 이번 편은 성격이 다릅니다 — 버그가 아니라 **성능 수치를 믿었다가 틀렸던 순간들**의 기록입니다. 셋 다 "그래 보인다"와 "실제로 그렇다" 사이의 간극을 직접 재서 확인해야 했던 사건입니다.

### 커넥션 풀을 열어보니 15개가 "아무 일도 안 하며" 잠겨있었다

VU 4,000 규모에서 결제 지연이 심하다는 리포트를 받고, Postgres가 지금 각 커넥션이 뭘 하고 있는지 보여주는 `pg_stat_activity`를 1초 간격으로 직접 스냅샷 찍어 관찰했습니다. 커넥션 풀(20개) 중 **최대 15개가 "idle in transaction"**(트랜잭션은 열려 있는데 다음 명령을 기다리며 아무 쿼리도 안 돌리는 상태) 이었습니다.

범인을 추적해보니 raw SQL로 이미 바꿔둔 `payment.processor.ts`는 이 목록에 전혀 안 나타났고, `confirm.processor.ts`의 `updateMany()`와 `createHeld()`(예약 생성)만 계속 걸렸습니다. Prisma Client의 일반 CRUD API(`create`/`updateMany` 등)가 단일 쓰기 하나를 실행할 때도 내부적으로 별도 트랜잭션 왕복을 추가로 여는 동작이 원인이었습니다 — 동시 요청이 많을 때 그 틈마다 커넥션이 "다음 단계를 기다리며 노는" 상태로 묶였던 겁니다. 두 파일을 같은 raw SQL 패턴으로 바꾸자 "idle in transaction"이 **정확히 0건**으로 사라졌습니다.

### BullMQ concurrency 기본값이 1이라는 걸 모르고 겪은 사건

BullMQ 워커를 등록할 때 `concurrency` 옵션을 안 주면 기본값은 **1**입니다 — job을 한 번에 딱 하나씩만 처리합니다. 5,000명이 동시에 결제를 시도하는 대용량 테스트에서는, 커넥션 풀을 아무리 넉넉히 늘려도 워커 자체가 줄을 세워 처리해 **job 하나가 처리되기까지 실측 3분 34초**가 걸렸습니다. 그사이 HELD의 30초 TTL이 먼저 지나 sweep에 회수돼버려(4편에서 다룬 바로 그 sweep입니다), "결제는 성공했는데 예약은 만료됨"이라는 정합성 불일치를 낳았습니다.

커넥션 풀 크기(20)와 맞춰 `concurrency: 20`으로 올리는 것으로 당장은 해결했지만, 이건 "발생 빈도를 줄이는" 처방이었을 뿐입니다 — VU 규모를 더 키우면 같은 경합이 다시 재현되는 구조적 문제였고, 근본 해결(백프레셔)은 2편에서 다룬 내용으로 이어집니다.

### "처리량"을 잘못 측정하고 스스로 정정한 이야기

결제 지연을 조사하던 중, `payment` 큐의 대기열이 5초 동안 2,200건에서 1,941건으로 줄어든 걸 보고 "약 51건/초"라고 계산해 "처리량이 설계값(130/초)보다 훨씬 낮다"고 1차 진단했습니다.

이건 측정 방법 자체의 결함이었습니다. 그 5초 동안에도 입장 허가(admission)가 계속 새 job을 큐에 밀어넣고 있었기 때문에, **"대기열이 줄어드는 속도"(순감소)는 "처리량"과 다릅니다** — 수조에 물이 들어오면서 동시에 빠지고 있는데, 수위가 줄어드는 속도만 보고 "배수구 속도"라고 잘못 판단한 셈입니다. 입장 허가 폴링이 백그라운드에서 계속 도는 실제 조건 그대로 다시 격리 측정(1,500명 투입 후 즉시 정리)해보니 **1,500건이 12.2초, 초당 150~170건** — 이전 세션의 순수 격리 측정치(2편에서 다룬 130/초 산정의 근거)와 일치했습니다. 큐 워커 자체는 처음부터 건강했던 겁니다.

> 세 사건 다 공통점이 있습니다 — 눈에 보이는 증상(느리다, 안 줄어든다) 하나를 두고 원인을 섣불리 짚는 대신, 매번 "그 수치가 정말 내가 생각하는 걸 재고 있는가"부터 다시 확인해야 했습니다. `pg_stat_activity`를 직접 열어보지 않았다면, concurrency 기본값을 코드에서 직접 확인하지 않았다면, 순감소와 처리량을 구분하지 않았다면 — 셋 다 틀린 진단에서 멈췄을 겁니다.

## 참고자료

- [PostgreSQL 공식 문서 — pg_stat_activity (idle in transaction 상태)](https://www.postgresql.org/docs/current/monitoring-stats.html)
- [BullMQ 공식 API 문서 — WorkerOptions.concurrency (기본값 1)](https://docs.bullmq.io/api/interfaces/v4.WorkerOptions.html)
- [Sunchak 프로젝트 — 백프레셔 설계 결정(ADR 0023)](https://github.com/xogus303/Sunchak/blob/bd349dcbff15846d02132d9619d4580b670faa40/docs/decisions/0023-load-test-admission-backpressure.md)
