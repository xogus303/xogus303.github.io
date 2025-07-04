---
date: '2023-02-13'
series: ''
title: 'HTTP통신'
categories: ['Network']
summary: '인터넷에서, 웹 서버와 사용자의 인터넷 브라우저 사이에 문서와 같은 리소스를 전송하기 위해 사용되는 통신 규약'
thumbnail: '../../static/postThumbnails/postThumbnail_230213.jpeg'
---

> HTTP는 HTML 문서와 같은 리소스들을 가져올 수 있도록 해주는 프로토콜이다. 웹에서 이루어지는 모든 데이터 교환의 기초이며, 수신자 측에 의해 요청이 초기화되는 클라이언트-서버 프로토콜이기도 하다. 보통 브라우저인 클라이언트에 의해 전송되는 메시지를 요청(request)이라고 부르며, 그에 대해 서버에서 응답으로 전송되는 메시지를 응답(response)이라고 부른다. HTTP는 애플리케이션 계층의 프로토콜로, 신뢰 가능한 전송 프로토콜이라면 이론상으로 무엇이든 사용할 수 있으나 TCP 혹은 암호화된 TCP 연결인 TLS를 통해 전송된다.

---

## 1. 구성요소

각각의 개별적인 요청들은 서버로 보내지며, 서버는 요청을 처리하고 response라고 불리는 응답을 제공한다. 이 요청과 응답 사이에는 여러 개체들이 있는데, 예를 들면 다양한 작업을 수행하는 게이트웨이 또는 캐시 역할을 하는 프록시 등이 있다.

### 클라이언트: 사용자 에이전트

사용자 에이전트는 사용자를 대신하여 동작하는 모든 도구이다. 이 역할은 주로 브라우저에 의해 수행되며 항상 요청을 보내는 개체이다.

### 웹 서버

통신 채널의 반대편에는 클라이언트에 의한 요청에 대한 문서를 제공하는 서버가 존재한다.

### 프록시

웹 브라우저와 서버 사이에는 수많은 컴퓨터와 머신이 HTTP 메시지를 이어 받고 전달한다. 여러 계층으로 이루어진 웹스택 구조에서 이러한 컴퓨터/머신들은 대부분은 전송, 네트워크 혹은 물리 계층에서 동작하며, 성능에 상당히 큰 영향을 주지만 HTTP 계층에서는 이들이 어떻게 동작하는지 눈에 보이지 않는다. 이러한 컴퓨터/머신 중에서도 애플리케이션 계층에서 동작하는 것들을 일반적으로 프록시라고 부르며 다양한 기능들을 수행할 수 있다.

- 캐싱
- 필터링 (바이러스 백신 스캔, 유해 컨텐츠 차단)
- 로드 밸런싱 (여러 서버들이 서로 다른 요청을 처리하도록 허용)
- 인증 (다양한 리소스에 대한 접근 제어)
- 로깅 (이력 정보 저장)

##

## 2. HTTP의 특징

**< 간단하다 >**
HTTP는 사람이 읽을 수 있으며 간단하게 고안되었다. HTTP 메세지를 프레임별로 캡슐화하여 간결함을 유지하였다. 메시지들을 사람이 읽고 이해할 수 있어, 테스트하기 쉽고 초심자의 진입장벽을 낮췄다.

##

**< 확장 가능성 >**  
HTTP/1.0에서 소개된, HTTP 헤더는 HTTP를 확장하고 실험하기 쉽게 만들어주었다. 클라이언트와 서버가 새로운 헤더의 시맨틱에 대해 간단히 합의만 한다면, 언제든지 새로운 기능을 추가할 수 있다.

##

**< Stateless >**  
HTTP는 상태를 저장하지 않는다(Stateless). 동일한 연결 상에서 연속하여 전달된 두 개의 요청 사이에는 연결고리가 없다. HTTP의 핵심은 상태가 없는 것이지만 HTTP 쿠키는 상태가 있는 세션을 만들도록 해준다. 헤더 확장성을 사용하여, 동일한 컨텍스트 또는 동일한 상태를 공유하기 위해 각각의 요청들에 세션을 만들도록 HTTP 쿠기가 추가된다.

##

**< HTTP와 연결 >**  
연결은 전송 계층에서 제어되므로 근본적으로 HTTP영역 밖이다. HTTP는 연결될 수 있도록 하는 근본적인 전송 프로토콜을 요구하지 않는다. 인터넷 상의 가장 일반적인 두 개의 전송 프로토콜 중에서 TCP는 신뢰할 수 있으며 UDP는 그렇지 않다. 그러므로 HTTP는 연결이 필수는 아니지만 연결 기반인 TCP 표준에 의존한다.

##

**< 제어 가능한 기능 >**

- **캐시**
  문서가 캐시되는 방식을 제어할 수 있다. 서버는 캐시 대상과 기간을 프록시와 클라이언트에 지시할 수 있고 클라이언트는 저장된 문서를 무시하라고 중간 캐시 프록시에게 지시할 수 있다.
- **origin 제약사항 완화**  
  스누핑과 다른 프라이버시 침해를 막기 위해, 브라우저는 웹 사이트 간의 엄격한 분리를 강제한다. 동일한 origin으로부터 온 페이지만이 웹 페이지의 전체 정보에 접근할 수 있다. 그런 제약 사항은 서버에 부담이 되지만, HTTP 헤더를 통해 완화시킬 수 있고 그 덕분에 문서는 다른 도메인으로부터 전달된 정보를 패치워크할 수 있다.
- **인증**  
  어떤 페이지들은 보호되어 오로지 특정 사용자만이 그것에 접근할 수도 있다. 기본 인증은 HTTP를 통해 WWW-Authenticate 또는 유사한 헤더를 사용해 제공되거나, HTTP 쿠키를 사용해 특정 세션을 설정하여 이루어질 수도 있다.
- **프록시와 터널링**  
  서버 혹은 클라이언트 혹은 그 둘 모두는 종종 인트라넷에 위치하며 다른 개체들에게 그들의 실제 주소를 숨기기도 한다. HTTP 요청은 네트워크 장벽을 가로지르기 위해 프록시를 통해 나가게 되며 모든 프록시가 HTTP 프록시는 아니다. FTP와 같은 다른 프로토콜도 이 프록시를 통해 처리될 수 있다.
- **세션**  
  쿠키 사용은 서버 상태를 요청과 연결하도록 해준다. 이것은 HTTP가 기본적으로 상태없는 프로토콜임에도 세션을 만들어주는 게기가 된다. 이것은 e-커머스 쇼핑 바구니를 위해서 유용할 뿐만 아니라 사용자 구성을 허용하는 모든 사이트에 대해서 유용하다.

##

## 3. HTTP의 흐름

1. **TCP 연결을 연다.** TCP 연결은 요청을 보내거나(혹은 여러개의 요청) 응답을 받는데 사용된다. 클라이언트는 새 연결을 열거나, 기존 연결을 재사용하거나, 서버에 대한 여러 TCP 연결을 열 수 있다.
2. **HTTP 메시지를 전송한다.** HTTP 메시지(HTTP/2 이전)는 인간이 읽을 수 있다.
3. **서버에 의해 전송된 응답을 읽어들인다.**
4. **연결을 닫거나 다른 요청들을 위해 재사용한다.**

##

## 4. HTTP의 메시지

**요청**

- **Method**: HTTP 메서드, 주어진 리소스에 수행하길 원하는 행동을 나타냄. 각각의 메서드는 서로 다른 의미를 구현하지만, 일부 기능은 메서드 집합 간에 서로 공유하기도 한다. 이를테면 응답 메서드는 안전하건, 캐시 가능하거나, 멱등성을 가질 수 있다.
- **Path**: 가져오려는 리소스의 경로, 예를 들어 프로토콜(http://), 도메인(www.naver.com), 또는 TCP 포트(80)의 요소들을 제외한 리소스의 URL.
- **version of the protocol**: HTTP 프로토콜의 버전.
- **Headers**: 서버에 대한 추가 정보를 전달하는 선택적 헤더들.
- **본문**: POST와 같은 몇 가지 메서드를 위한, 전송된 리소스를 포함하는 응답의 본문과 유사한 본문
- **HTTP 메서드**: 보통

**응답**

- **version of the protocol**: HTTP 프로토콜의 버전.
- **Status code**: 요청의 성공 여부와, 그 이유를 나타내는 상태 코드
- **Status message**: 아무런 영향력은 없는, 상태 코드의 짧은 설명을 나타내는 상태 메시지
- **Headers**: 요청 헤더와 비슷한 HTTP 헤더들
- **본문**: 선택사항으로 가여온 리소스가 포함되는 본문

---

HTTP는 사용이 쉬운 확장 가능한 프로토콜이다. 헤더를 쉽게 추가하는 능력을 지닌 클라이언트-서버 구조는 HTTP가 웹의 확장된 수용력과 함께 발전할 수 있게 한다.

#

## 참고자료

[<https://developer.mozilla.org/ko/docs/Web/HTTP/Overview>](https://developer.mozilla.org/ko/docs/Web/HTTP/Overview)
