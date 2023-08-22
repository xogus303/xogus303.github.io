---
startDate: '2023-08-22'
date: '2023-08-22'
series: ''
title: 'Cache'
categories: ['Network']
summary: 'Web Cache란 무엇이며 어떻게 동작하는가'
thumbnail: '../../static/postThumbnails/postThumbnail_230822.png'
---

> 웹 사이트를 운영하면서 캐시는 어떤 방식으로 설정할 수 있고 정확히 사용자에게 어떻게 적용되는지 파악하여 더 나은 사용자 경험을 제공하기 위해 캐시에 대해서 알아본다. 프로젝트의 업데이트 사항을 배포하고 실제 도메인을 통해 사이트를 확인해보면, 업데이트를 바로 확인할 수 있는게 있고 캐시를 삭제한 후 새로고침해야 업데이트된 내용이 확인되는 경우가 있었다. 프레임워크를 사용한 사이트의 경우 접속하자마자 확인 가능했고 그렇지 않고 정적 리소스로 이루어진 사이트의 경우 캐시를 삭제해야 했다. 정확한 이유를 확인해보고 적재적소에 사용할 수 있도록 한다.

###

# 웹 캐시란

웹 캐시(web cache) 또는 HTTP 캐시(HTTP cache)는 서버 지연을 줄이기 위해 웹 페이지, 이미지, 기타 유형의 웹 멀티미디어 등의 웹 문서들을 임시 저장하기 위한 정보기술이다. 동일한 서버에 다시 접근할 때에는 근처에 있는 프록시 서버의 웹 캐시에 저장된 정보를 불러오기 때문에 더 빠르다.

# 종류

1. Browser Caches
   - 
2. 

# 적용기준

#### 1. **XMLHttpRequest와** **Fetch API 호출**

브라우저가 서버에 통신 요청을 처리할 수 있도록 내장된 객체이다. XMLHttpRequest는 서버로부터 XML 데이터를 전송받아 처리하는데 사용된다. Fetch API는 XMLHttpRequest보다 강력하고 유연한 대체제이다. Request와 Response객체, 기타 네트워크 요청에 관련된 것들을 사용하고, CORS와 HTTP Origin 헤더 행동 등 관련 개념도 포함한다.

#### 2. **웹 폰트 (CSS내 @font-face에서 교차 도메인 폰트 사용 시)**

#### 3. **WebGL 텍스쳐**

Web Graphics Library의 약자로 웹상에서 2D 및 3D 그래픽을 렌더링하기 위한 로우 레벨 javascript API. 3D 모델은 텍스처를 입히는 방법으로 세부적인 질감을 표현하거나 색을 칠하는 기법을 사용하는데 외부에서 텍스쳐를 불러오는 경우

#### 4. **drwaImage()를 사용해 캔버스에 그린 이미지/비디오 프레임**

drwaImage()는 canvas에 이미지를 그리는 다양한 방법을 제공한다.

#### 5. **이미지로부터 추출하는 CSS Shapes**

이미지를 이용하여 도형을 출력하는 경우 해당 이미지의 출처가 사이트와 동일해야 한다.

# 설정방법

주소만 알면 누구든 서버에게 통신을 요청할 수 있기때문에 서버는 자체적으로 응답을 받을 수 있는 클라이언트를 명시하여 보안성을 높이기 위한 정책이다. 결론적으로 클라이언트가 받는 응답의 Access-Control-Allow-Origin 값에 따라 정책의 위반 여부를 결정하기 때문에 다음과 같은 방법으로 정책을 준수 할 수 있다.
</br></br>
**1. 서버 응답 헤더에 Access-Control-Allow-Origin 명시**

```javascript{numberLines: true}
res.setHeader('Access-Control-Allow-Origin', 'localhost:3000')
res.end()
```

**2. cors 미들웨어 사용**
```shell
npm install cors
```
```javascript{numberLines: true}
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors({
  origin: 'localhost:3000'
}))

```
**3. Proxy 서버 경유**

앞서 설명한 바와 같이 CORS 정책은 브라우저와 서버 간의 보안 정책이다. 때문에 서버와 서버 간의 통신에서는 적용되지 않는 점을 이용하여 중간다리 역할을 해주는 Proxy 서버를 설정하는 방법이다.</br></br>
     1) 브라우저와 도메인이 같은 서버 생성  
     2) 브라우저는 실제 통신할 서버 대신 프록시 서버에 요청  
     3) 요청을 받은 프록시 서버는 실제 서버에 요청을 보내고 응답을 받아서 브라우저에게 다시 응답  
     4) 브라우저는 도메인이 같은 서버와 통신하여 응답받았기 때문에 CORS 정책을 준수
#
> 끝말

---

## 참고자료

- 웹 캐시, 위키백과  
  [<https://ko.wikipedia.org/wiki/%EC%9B%B9_%EC%BA%90%EC%8B%9C>](https://ko.wikipedia.org/wiki/%EC%9B%B9_%EC%BA%90%EC%8B%9C)
