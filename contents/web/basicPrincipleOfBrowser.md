---
date: '2023-01-19'
series: '브라우저의 동작 원리'
title: '2.5초 안에 일어나는 일'
categories: ['Web']
summary: '사용자가 주소 또는 검색 내용을 입력한 뒤 웹페이지가 노출되기 까지의 모든 흐름에 대하여'
thumbnail: '../../static/postThumbnails/postThumbnail_230131.png'
---

# 2.5초

2023년 [tooltester의 웹사이트 로딩 시간 통계](https://www.tooltester.com/en/blog/website-loading-time-statistics/#top100)에 따르면 평균 웹 페이지 로드 시간은 데스크톱에서 2.5초이다. 이말은 즉 사용자가 브라우저를 열고 검색창 또는 주소창에 무엇인가 입력한 뒤 브라우저가 해당 결과를 표시하기 까지 걸리는 시간은 평균적으로 2.5초이다. 어떤 원리와 동작에 의해 웹페이지가 처리되는지 알아보자.

### 1. 웹 서버 요청

사용자는 브라우저를 통해 원하는 웹페이지를 보기 위해 주소창에 주소를 입력한다. 이때 브라우저 엔진이 입력받은 주소를 네임서버로 요청한다. 네트워크 상에서 컴퓨터들이 서로를 구별하고 통신하는 IP주소 대신 쉬운 문자를 이용하여 DNS를 운영하는 네임서버로 부터 실제 IP주소를 응답 받는다.

### 2. 웹 서버 응답

---

## Source

- tooltester의 웹사이트 로딩 시간 통계

  [<https://www.tooltester.com/en/blog/website-loading-time-statistics/#top100>](https://www.tooltester.com/en/blog/website-loading-time-statistics/#top100)
