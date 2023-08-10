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
- **Origin**: \* (credential이 없는 모든 임의의 출처), 없음, 특정 출처에 대한 정보

단순 요청은 특정 조건을 만족하는 경우 사전 요청 없이 바로 실제 요청이 이루어진다. 이때 사전요청과 마찬가지로 서버의 응답에 포함된 Access-Control-Allow-Origin 값을 보고 허용된 출처인지 판단하여 리소스를 로드한다.
사전 요청에 대한 상태코드가 200으로 성공이 응답되더라도 실제 요청과는 별개로 응답 헤더에 유효한 Access-Control-Allow-Origin 값이 존재하는지가 중요하다.

# 출처(Origin)

클라이언트와 서버는 모두 URL과 같은 고유 주소 값을 갖고 통신할 때 각 주소를 공유한다. 이 주소를 통해 서로의 출처를 확인 할 수 있으며 허용되지 않은 출처일 때 브라우저는 CORS 정책 위반 에러를 표시하며 리소스 로드를 거부한다.
https://<k>www<k>.<k>naver.<k>com과 같은 URL은 여러 개의 구성 요소로 이루어져 있다. 그중 아래 3가지가 출처의 기준이 되는 요소이다.

- **< scheme >**: 프로토콜에 해당하며 일반적으로 HTTP 프로토콜 혹은 보안 버전인 HTTPS를 사용한다.
- **< hostname >**: 서버(가상 호스팅)의 이름 또는 IP. 아래 이미지 중 서브 도메인, 도메인 및 도메인 확장자가 해당.
- **< port >**: 서버와 연결을 맺기 위한 TCP 포트번호. 포트번호를 입력하지 않으면 요청한 서비스의 기본 포트가 사용된다(HTTP의 경우 기본 80번 포트 사용).

##

!["URL의 구조"](../../static/URL.png)

##

3가지 구성요소만 같으면 그 외 나머지 요소들이 다른 URL이더라도 같은 출처로 인식한다.  
https://<k>www<k>.<k>naver.<k>com과의 비교

**같은 출처**

`https://www.naver.com/main`, `https://www.naver.com/main?name=안녕하세요`, `https://korea@www.naver.com`

**다른 출처**

`http://www.naver.com`(프로토콜), `https://www.naver.co.kr`(도메인확장자), `https://www.naver.com:433`(포트번호)

# 적용기준

#### 1. **XMLHttpRequest와** **Fetch API 호출**

브라우저가 서버에 통신 요청을 처리할 수 있도록 내장된 객체이다. XMLHttpRequest는 서버로부터 XML 데이터를 전송받아 처리하는데 사용된다. Fetch API는 XMLHttpRequest보다 강력하고 유연한 대체제이다. Request와 Response객체, 기타 네트워크 요청에 관련된 것들을 사용하고, CORS와 HTTP Origin 헤더 행동 등 관련 개념도 포함한다.

#### 2. **웹 폰트 (CSS내 @font-face에서 교차 도메인 폰트 사용 시)**

#### 3. **WebGL 텍스쳐**

Web Graphics Library의 약자로 웹상에서 2D 및 3D 그래픽을 렌더링하기 위한 로우 레벨 javascript API. 3D 모델은 텍스처를 입히는 방법으로 세부적인 질감을 표현하거나 색을 칠하는 기법을 사용하는데 외부에서 텍스쳐를 불러오는 경우

#### 4. **drwaImage()를 사용해 캔버스에 그린 이미지/비디오 프레임**

drwaImage()는 canvas에 이미지를 그리는 다양한 방법을 제공한다.

#### 5. **이미지로부터 추출하는 CSS Shapes**

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
- URL이란 무엇인가?, 김민수, Ascent
  [<https://www.ascentkorea.com/what-is-url/>](https://www.ascentkorea.com/what-is-url/)
