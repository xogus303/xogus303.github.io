---
startDate: '2023-08-07'
date: '2023-08-07'
series: ''
title: 'CORS'
categories: ['Network']
summary: 'HTTP의 Cross-Origin Resource Sharing에 대하여'
thumbnail: '../../static/postThumbnails/postThumbnail_230807.png'
---

> Cross-Origin Resource Sharing의 줄임말로, 직역하면 교차 출처 리소스 공유라고 해석할 수 있으며 실제로 교차 출처의 의미는 정해지지 않은 출처라고 할 수 있다. CORS는 HTTP 헤더 기반 메커니즘으로, API 서버를 사용하는 웹 애플리케이션은 다른 출처의 응답에 올바른 CORS 헤더가 포함되지 않는 한 애플리케이션이 로드된 동일한 출처의 리소스만 요청할 수 있다. 즉 서버는 허용하는 출처에 대한 응답을 주고 브라우저에서는 응답에 포함되는 출처일 때만 로드한다. 때문에 서버의 주소나 요청 경로가 모두 노출되어도 아무나 요청에대한 응답을 받을 수 없게하는, 브라우저와 서버간 보안성을 높여주기 위한 정책이라고 할 수 있다.

---

###

# 사전요청(Preflight)

브라우저는 본격적인 HTTP 요청 전에 서버 측에 요청에 대한 메서드와 헤더에 대해 인식하고 있는지 체크하는 사전 요청을 한다. 사전 요청은 단순 요청(simple requests)을 제외한 일반적인 상황에서 자동으로 발생한다. 일반적인 HTTP 메소드가 아닌 **OPTIONS**를 사용하여요청하며 본 요청에서 포함될 3가지 정보들을 미리 보낸다.

- **Access-Control-Method**: 실제 요청 시 클라이언트가 보낼 수도 있는 HTTP request methods 중 하나 (GET, POST, DELETE 등)
- **Access-Control-Request-Headers**: 실제 요청 시 포함될 수 있는 부가적인 정보인 HTTP header에 대한 정보
- **Origin**: \*(credential이 없는 모든 임의의 출처), 없음, 특정 출처에 대한 정보

단순 요청은 특정 조건을 만족하는 경우 사전 요청 없이 바로 실제 요청이 이루어진다. 이때 서버의 응답에 포함된 Access-Control-Allow-Origin 값을 보고 허용된 출처인지 판단하여 리소스를 로드한다.

# 출처(Origin)

클라이언트와 서버는 모두 URL과 같은 고유 주소 값을 갖고 통신할 때 각 주소를 공유한다. 이 주소를 통해 서로의 출처를 확인 할 수 있으며 허용되지 않은 출처일 때 브라우저는 CORS 정책 위반 에러를 표시하며 리소스 로드를 거부한다.

# 사용법

# 4.

---

HTTP는 사용이 쉬운 확장 가능한 프로토콜이다. 헤더를 쉽게 추가하는 능력을 지닌 클라이언트-서버 구조는 HTTP가 웹의 확장된 수용력과 함께 발전할 수 있게 한다.

#

## 참고자료

- CORS는 왜 이렇게 우리를 힘들게 하는걸까?, Evan Moon, Evans Library  
  [<https://evan-moon.github.io/2020/05/21/about-cors/>](https://evan-moon.github.io/2020/05/21/about-cors/)
- Cross-Origin Resource Sharing(CORS), mdn web docs
  [<https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/>](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/)
- 사전 요청, mdn web docs
  [<https://developer.mozilla.org/ko/docs/Glossary/Preflight_request>](https://developer.mozilla.org/ko/docs/Glossary/Preflight_request)
- OPTIONS, mdn web docs
  [<https://developer.mozilla.org/ko/docs/Web/HTTP/Methods/OPTIONS>](https://developer.mozilla.org/ko/docs/Web/HTTP/Methods/OPTIONS)
