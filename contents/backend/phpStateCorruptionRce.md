---
startDate: '2026-10-30'
date: '2026-10-30'
series: ''
title: '메모리가 바닥나자 서버가 넘어갔다 — PHP 코어를 뒤흔든 치명적 결함 2건 (일명 PHP2Shell)'
categories: ['Backend']
tags: ['PHP', '보안', 'RCE']
thumbnail: '../../static/postThumbnails/postThumbnail_261030_phpStateCorruptionRce.png'
summary: '인증 없이 요청만으로 서버를 장악할 수 있던 PHP 코어의 치명적 결함 2건 — 메모리 부족이 왜 코드 실행으로 이어졌는지, 2008년부터 있던 버그가 왜 지금에야 터졌는지, 그리고 지금 해야 할 일'
---

> 2026년 10월 21일, php.net이 평소와 다른 보안 공지를 올렸습니다. 제목은 "Critical remote code execution vulnerabilities, update now"였고, 심각도는 10점 만점에 9.2점(CVSS v4.0). 더 심각한 건 "인증이 전혀 필요 없다"는 조건이었습니다 — 로그인도, 계정도, 특별히 취약한 설정도 필요 없이, 그냥 평범한 HTTP 요청만으로 서버 안에서 공격자의 코드가 실행될 수 있다는 뜻입니다. PHP는 지금도 전 세계 수많은 웹사이트의 서버 쪽 언어로 쓰이는 만큼, 이 공지 하나가 인터넷 곳곳에 영향을 미쳤습니다. 이 글에서는 이 취약점 두 건(CVE-2026-109618, CVE-2026-109619)이 정확히 무엇이었는지, 왜 비슷한 하자가 2008년부터 보고돼 있었는데도 2026년에야 치명적인 RCE로 터졌는지, 실제로 어떻게 악용됐는지, 그리고 지금 무엇을 해야 하는지를 정리합니다.

### "메모리가 바닥나자, 반쪽짜리 요청이 남았다" — CVE-2026-109618

PHP는 요청 하나를 처리하면서 세션, 에러 정보, 익스텐션 내부 상태 같은 **워커(worker) 전역 상태**를 채워나갑니다. (PHP는 요청마다 새 프로세스를 띄우지 않고, 미리 떠 있는 프로세스 하나가 요청을 처리한 뒤 바로 다음 요청도 재사용합니다 — 이 재사용되는 프로세스가 워커입니다.) 이 전역 상태는 요청이 끝나면 반드시 깨끗이 리셋되어야 다음 요청에서 안전하게 재사용할 수 있습니다.

문제는 이 설정 작업이 끝나기 전에 서버 메모리가 한도(`memory_limit`)를 넘으면 벌어집니다. PHP는 이 순간 `zend_bailout()`을 호출해 `longjmp()`로 **콜스택을 단계별로 거슬러 올라가지 않고, 미리 정해둔 지점으로 한 번에 건너뜁니다**(C 언어의 non-local jump). 그 과정에서 아래와 같은 일이 벌어집니다.

<aside class="post-aside"><ol>
<li><strong>전역 상태 설정 시작</strong> — 요청을 처리하며 세션·에러 정보 등 워커 전역 상태를 채우기 시작한다. 이 상태는 요청이 끝나면 반드시 리셋돼야 한다.</li>
<li><strong>메모리 한도 초과</strong> — 설정이 끝나기 전에 memory_limit을 넘으면 PHP가 longjmp()로 즉시 콜스택을 건너뛴다.</li>
<li><strong>리셋 코드 생략</strong> — 이 건너뛰기 과정이 1번의 리셋 코드까지 도달하지 못해, 전역 포인터가 "곧 해제될 메모리"를 계속 가리키는 댕글링 포인터(dangling pointer, 가리키는 대상이 사라졌는데도 남아있는 포인터)로 남는다.</li>
<li><strong>다음 사용에서 메모리 손상</strong> — 요청 종료 후 그 메모리는 해제되는데, 남아있는 포인터를 나중에 다시 참조하면 해제된 메모리를 읽거나 쓰는 use-after-free가 발생한다. 그 자리에 이미 다른 데이터가 들어와 있다면, 전혀 다른 타입의 데이터를 원래 타입으로 착각하는 타입 혼동(type confusion)까지 이어질 수 있다.</li>
</ol></aside>

mod_php는 "시작이 실패해도 요청 종료 처리는 무조건 실행"하는 구조라 특히 취약하다고 공식 권고(GHSA-w8hw-w9fx-j79w)에 명시돼 있습니다. PHP를 운영하는 또 다른 방식인 **PHP-FPM**(FastCGI Process Manager, PHP를 별도의 독립된 프로세스 풀로 띄워 웹서버와 분리해 운영하는 방식)은 이 경로에 상대적으로 덜 노출됩니다 — FPM은 요청 "시작" 자체가 실패하면 그 워커 프로세스를 통째로 종료시키기 때문에, mod_php처럼 "실패해도 끝까지 정리는 한다"는 동작 자체가 없습니다. 다만 시작이 성공한 이후에 발생하는 다른 경로의 가능성은 남아있다고 공식 권고에 언급돼 있습니다.

실제 수정은 php-src 커밋 [`3584a98bda0f`](https://github.com/php/php-src/commit/3584a98bda0f)("Avoid state corruption via bailout")에서 이뤄졌는데, 핵심은 **"OOM이 나도 즉시 건너뛰지 않는 것"**입니다. 가상머신이 안전하다고 보장하는 지점(safe point)까지 기다렸다가 처리하는 "soft OOM"과, 그래도 안 되면 `_exit()`로 프로세스 자체를 즉시 끝내버리는 "hard OOM"으로 나누고, 탈출이 일어나도 문제가 안 생기도록 여러 전역 변수를 애초에 안전한 값으로 미리 초기화해두는 방식으로 고쳤습니다.

### "다음 손님이, 앞 손님이 두고 간 포인터를 밟았다" — CVE-2026-109619

두 번째 결함은 뿌리는 같지만 트리거 조건이 더 넓습니다. ①이 메모리 부족 하나로 발생했다면, 이건 **치명적 오류라면 뭐든 해당됩니다** — 파싱/컴파일 오류, 처리되지 않은 예외, `require` 실패, 최대 실행시간 초과, 그리고 ①의 OOM까지 전부 포함됩니다. 게다가 이번엔 **서로 다른 두 요청**이 필요합니다.

<aside class="post-aside"><ol>
<li><strong>요청 A (생산자)</strong> — 파싱 오류·예외·require 실패·실행시간 초과·OOM 중 하나로 요청이 비정상 종료되며, 전역 상태를 리셋하는 코드가 생략된다.</li>
<li><strong>같은 워커로 재사용</strong> — PHP 워커는 요청이 끝나도 종료되지 않고 다음 요청을 이어서 처리한다.</li>
<li><strong>요청 B (소비자)</strong> — 같은 워커가 받은 다음 요청에서, 정규 초기화가 끝나기도 전에 1번에서 남은 낡은 전역 상태를 먼저 읽는 코드가 실행된다.</li>
<li><strong>Use-After-Free 발생</strong> — 요청 A가 끝나며 이미 해제된 메모리를, 요청 B가 아직 유효한 것처럼 읽거나 쓴다.</li>
</ol></aside>

공식 권고(GHSA-6wmf-4rv5-p3rp)가 실제로 확인한 "요청 B" 쪾 소비자 경로는 두 가지입니다. 하나는 **초기화 이전 INI 경고**(잘못되거나 폐기된 `memory_limit`, 레거시 `assert.*`·세션 설정 등에서 나오는 경고로, `error_reporting`을 꺼도 못 막습니다), 다른 하나는 **세션 업로드 진행 상황(upload progress) 처리**로, 기본 설정에서 이미 켜져 있습니다. 영향받는 서버 환경(SAPI)도 명시돼 있는데, **Apache mod_php는 확인된 공격 대상**이고, PHP-FPM은 프런트엔드가 특정 설정(`PHP_VALUE`/`PHP_ADMIN_VALUE`)을 전달하는 조건에서만 노출됩니다.

여기서 공격자가 보내는 두 번째 요청, 즉 요청 B는 그 자체로는 특별히 수상해 보이지 않는 평범한 요청입니다. 다만 그 전에 공격자가 **요청 A로 먼저 함정을 깔아놔야** 성립합니다 — 공격이 한 번의 평범한 요청이 아니라, "일부러 오류를 유발하는 요청 + 뒤따라 보내는 평범한 요청"이라는 두 단계 조합이라는 게 핵심입니다.

### 2008년부터 있던 버그가, 왜 2026년에야 터졌나

이 취약점의 근본 패턴 — `zend_bailout()`/`longjmp()`가 작업 중간에 콜스택을 건너뛰면서 정리 코드를 생략시키는 것 — 은 사실 전혀 새로운 발견이 아닙니다. php.net의 공개 버그 트래커에는 이미 다음과 같은 기록이 남아 있습니다.

- **[Bug #46025](https://bugs.php.net/bug.php?id=46025)** (2008년 9월): `max_execution_time` 초과로 `zend_bailout`이 발생할 때, 당시 널리 쓰이던 캐시 익스텐션 APC가 공유 메모리 세그먼트를 잠근 상태라면 그 세그먼트가 손상되고 뮤텍스가 교착 상태에 빠진다는 보고.
- **[Bug #59281](https://bugs.php.net/bug.php?id=59281)** (2010년 6월): 같은 메커니즘이 `memory_limit` 초과로도 발생해, 웹서버 전체가 멈출 수 있다는 후속 보고.

즉 "bailout이 정리 코드를 건너뛰면서 뭔가를 망가뜨린다"는 사실 자체는 15년도 더 전에 이미 보고돼 있었습니다. 하지만 당시엔 이게 **APC라는 특정 서드파티 익스텐션에 한정된 "가용성 문제"**(크래시나 교착 상태로 Apache를 재시작해야 하는 정도)로 취급됐습니다. PHP 코어 자체의 문제라기보다는, "APC가 락을 잡은 채 bailout을 못 견딘다"는 식으로 좁게 이해된 것입니다.

그리고 2016년, Bug #59281은 **"Won't fix"**로 닫혔습니다. 이유는 간단했습니다 — APC 자체가 더 이상 지원되지 않고, PHP에 기본 포함된 OPcache로 대체됐기 때문입니다. 버그를 고친 게 아니라, **그 버그가 드러나던 통로(APC)가 없어지면서 문제가 안 보이게 된 것**입니다. `zend_bailout()`/`longjmp()`라는 근본 메커니즘 자체는 PHP 코어 안에 그대로 남아있었습니다.

2026년에 밝혀진 건, 이 똑같은 패턴이 **서드파티 익스텐션이 아니라 PHP 코어 자신의 요청 처리 로직(세션, 에러 핸들링, OPcache 등) 안에도 존재하고**, 그 결과가 "크래시"나 "교착 상태"에서 끝나지 않고 **메모리 손상을 거쳐 원격 코드 실행까지 이어질 수 있다**는 것이었습니다. 다만 2026년에 정확히 누가, 어떤 경위로 이걸 처음 발견해 PHP 팀에 신고했는지는 — 여러 매체에 서로 다른 버전이 떠돌고 있고, 신뢰할 수 있는 1차 소스로 확인되지 않아 이 글에서는 다루지 않습니다. 공식적으로 확인되는 건 **2026년 10월 21일, php-src 핵심 개발자들(arnaud-lb, iluuu1994, bukka, ndossche, nicolas-grekas)이 커밋 하나로 두 CVE를 동시에 수정**했다는 사실뿐입니다.

### 공개 전부터 시작된 공격, 그리고 "PHP2Shell"

이 취약점 조합에는 **"PHP2Shell"**이라는 이름이 붙었습니다. 공개 당시 돌던 통합 익스플로잇 스크립트의 이름에서 유래한 것으로 보이며, 이후 CISA·보안 업체들의 보도에서도 이 이름으로 불렸습니다.

<aside class="post-aside"><ol>
<li><strong>공개 4일 전</strong> — Amazon 위협 인텔리전스가 공격자들이 이미 이 결함을 겨냥하기 시작했다고 발표.</li>
<li><strong>공개 당일</strong> — Cloudflare CTO가 초기 공격 시도를 포착했다고 밝히며 자사 WAF(웹 애플리케이션 방화벽)에 대응 규칙을 배포. Patchstack도 호스팅 파트너로부터 공개 수 시간 전부터 다건의 활성 공격 사례를 전달받음. 다만 이 시점의 시도 대부분은 성공하지 못한 것으로 분류됨.</li>
<li><strong>공개 이후</strong> — Perplexity의 탐지·대응 책임자가 Apache mod_php(PHP 8.4.26) 허니팟에서 실제 RCE 시도가 기록된 것을 확인.</li>
<li><strong>10월 26일</strong> — CISA가 두 CVE를 KEV(실제 악용이 확인된 취약점) 카탈로그에 추가. 연방 민간 기관들은 BOD 26-04에 따라 정해진 기한까지 조치해야 하는 상황이 됨.</li>
</ol></aside>

다만 한 가지는 분명히 짚어야 합니다. GitHub 등에 공개된 PoC(개념 증명) 스크립트들이 돌고 있지만, **그 PoC의 기반이 된 공격 이론 자체를 작성자 본인이 나중에 무효화했다**는 보도(Recorded Future)가 있습니다. 즉 "공개된 PoC가 실제로 안정적으로 동작하는가"는 **아직 검증되지 않았고**, 실제로 성공한 침해의 정확한 규모나 기법도 공개된 증거만으로는 확정하기 어렵습니다. "공격 시도가 광범위했다"와 "그 시도들이 전부 성공했다"는 서로 다른 이야기라는 점은 구분해야 합니다.

### 지금 해야 할 일

<aside class="post-aside"><ol>
<li><strong>업데이트 — 유일한 완전한 해결책</strong> — PHP 8.2.35 / 8.3.36 / 8.4.27 / 8.5.12 이상으로 올린다. 8.1 이하는 공식 지원이 끝났지만, 이번 건의 심각도 때문에 예외적으로 최소 백포트 패치가 제공됐다.</li>
<li><strong>당장 업데이트가 어렵다면 — 완화책 (해결책은 아님)</strong> — 아래 설정을 적용하고 모든 워커를 재시작한다.</li>
</ol></aside>

```ini
memory_limit = -1
session.upload_progress.enabled = 0
; PHP 8.5라면 추가로:
fatal_error_backtraces = 0
```

php.net 공식 공지는 이 설정들이 **"시스템을 안전하게 만드는 게 아니라, 노출을 줄이는 것뿐"**이라고 명시합니다. `memory_limit = -1`은 메모리 한도 자체를 없애 OOM 트리거를 막지만, 서버 전체 메모리 고갈이라는 다른 위험을 대신 떠안는 조치이기도 합니다.

여기서 흔히 떠올리는 대안이 하나 있습니다 — "그럼 OS나 컨테이너 레벨에서 메모리 자체를 더 엄격히 제한하면 되지 않나"라는 생각입니다. 하지만 공식 권고는 **`RLIMIT_AS`/`RLIMIT_DATA`(리눅스에서 프로세스의 가상 메모리 주소 공간을 강제로 제한하는 설정)나 컨테이너의 cgroup 메모리 제한을 완화책으로 쓰지 말라고 명시적으로 경고**합니다. PHP의 `memory_limit`은 PHP 자신이 알고 반응하는 경로지만, OS 레벨 제한은 PHP 바깥의 커널이 더 예측하기 어려운 지점에서 할당을 실패시키기 때문에, 이번 패치가 다루지 않은 다른 취약한 실패 경로를 오히려 더 쉽게 유발할 수 있는 것으로 추정됩니다 — 이 "왜"에 대한 상세 메커니즘까지는 공식 문서에도 나와 있지 않습니다.

가능한 한 빨리 패치 버전으로 올리는 것이 유일하게 확실한 해결책입니다.

## 마치며

이 취약점의 근본 원인은 결국 "급하게 빠져나가는 코드(bailout)가, 그 뒤에 벌어질 정리 작업까지 책임지지 못한다"는 한 줄로 요약됩니다. 그리고 그 한 줄짜리 하자는 2008년에도, 2026년에도 똑같았습니다. 달라진 건 그게 **사라졌다고 믿었던 자리(APC)에서 실제로는 사라진 적이 없었고, 아무도 안 보던 자리(PHP 코어 자체)에 계속 남아있었다**는 사실이 드러난 것뿐입니다. "지원 종료된 익스텐션의 오래된 버그"로 치부하고 넘어갔던 패턴이, 20년 가까이 된 엔진의 핵심부에서 그대로 다시 발견된 셈입니다.

## 참고자료

- [php.net — Security advisory: Critical remote code execution vulnerabilities, update now](https://www.php.net/archive/2026.php)
- [GHSA-w8hw-w9fx-j79w — RCE via OOM corruption (CVE-2026-109618)](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)
- [GHSA-6wmf-4rv5-p3rp — RCE via stale global state (CVE-2026-109619)](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)
- [php-src 커밋 3584a98bda0f — "Avoid state corruption via bailout"](https://github.com/php/php-src/commit/3584a98bda0f)
- [bugs.php.net Bug #46025 — zend_bailout can deadlock APC](https://bugs.php.net/bug.php?id=46025)
- [bugs.php.net Bug #59281 — apc zend_bailout deadlock](https://bugs.php.net/bug.php?id=59281)
- [BleepingComputer — CISA confirms PHP2Shell vulnerabilities now exploited in attacks](https://www.bleepingcomputer.com/news/security/cisa-confirms-php2shell-vulnerabilities-now-exploited-in-attacks)
- [Recorded Future — PHP2Shell Exploitation: Two Critical PHP Flaws Explained](https://www.recordedfuture.com/blog/php2shell-vulnerability-exploitation)
