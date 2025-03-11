---
date: '2023-02-20'
series: ''
title: 'JavaScript의 동작'
categories: ['Javascript']
summary: '웹페이지를 구성하는 요소 중 동작 부분에 해당하는 JavaScript가 어떻게 실행되는지 이해해보자'
thumbnail: '../../static/postThumbnails/postThumbnail_230220.jpeg'
---

> JavaScript는 객체 기반의 스크립트 프로그래밍 언어이며 웹 브라우저 내에서 다양한 동작과 기능을 구현할 수 있도록 해줍니다. 웹사이트를 구현하는 여러 브라우저에서는 JavaScript를 실행시키기 위해 각각의 JavaScript 엔진이 존재하는데, 어떤 구조와 흐름으로 실행되는지 알아보겠습니다.

---

# 웹의 구성

브라우저는 사용자에게 웹페이지를 보여주기 위해 웹서버에 리소스를 요청합니다. 웹서버로부터 HTML, CSS, JavaScript 등의 파일을 응답받아 브라우저 엔진을 통해 화면에 렌더링 합니다. 그 중 JavaScript는 html 요소 및 브라우저 제어를 가능하게 하고, 사용자의 액션에 따른 동작을 처리하거나 이벤트를 발생시키기도 하며, 웹서버와 통신할 수 있게 해주는 핵심 역할을 담당하고 있습니다.<br>

# Javascript Runtime
코드가 실행되는 환경을 제공하는 소프트웨어 시스템을 의미합니다. 초기 웹 브라우저에서 실행되도록 설계되었지만, 이후 Node.js, Deno, Bun 같은 브라우저 외부 환경에서도 실행할 수 있도록 발전했습니다. JavsScript가 실행되는 환경을 JavaScript 런타임이라고 하며 각 런타임은 공통적으로 JavaScript 엔진을 포함하며 추가적인 API를 제공합니다. 브라우저 환경에서는 window 및 document와 같은 `Web API`를 통한 DOM 조작을 위한 API들를 제공하고, Node.js와 같은 브라우저 외부 환경에서는 파일 생성, 컴퓨터 정보 확인 등 `컴퓨터 제어`와 해당 `환경에 관련`된 특정 API들을 제공합니다.

# Javascript Engine
JavaScript 엔진은 프로그램 또는 인터프리터로, 코드를 분석하고 변환하여 실행하는 역할을 합니다. 브라우저에서 JavaScript엔진은 **DOM** 및 **Web IDL** 바인딩을 통해 브라우저 렌더링 엔진과 함께 작동합니다.

# Event Loop
JavaScript는 작성된 코드를 순차적으로 하나씩 실행시키며(하나의 호출 스택) 동시에 여러 호출을 실행할 수 없는 **single thread** 언어 입니다. 하지만 사용자가 느끼기에 전혀 불편함 없이 웹페이지는 이벤트를 처리하는데 바로 비동기 처리를 하기 때문입니다.
이벤트 루프는 비동기 작업을 효율적으로 관리하고, 콜 스택과 태스크 큐를 연결하여 블로킹 없이 작업을 수행할 수 있도록 도와주는 핵심 매커니즘 입니다.   
<br>

| 구성 요소                    | 역할                                                  |
| ---------------------------- | ----------------------------------------------------- |
| **콜 스택 (Call Stack)**     | 현재 실행 중인 코드(함수 등)를 관리                   |
| **Web APIs**                 | 비동기 작업 (fetch, setTimeout 등) 실행               |
| **태스크 큐 (Task Queue)**   | 완료된 비동기 작업의 콜백을 대기                      |
| **이벤트 루프 (Event Loop)** | 콜 스택이 비어있으면 태스크 큐에서 콜백을 가져와 실행 |

### 실행 흐름
1. JavaScript 코드가 실행되면, **콜 스택**에 추가되어 실행됨.
2. 비동기 작업 (setTimeout, fetch 등)은 **Web API**가 실행하고 콜백 작업을 **태스크 큐**로 보냄.
3. 이벤트 루프는 **콜 스택이 비었는지 확인**.
4. 콜 스택이 비어 있으면, **태스크 큐에서 콜백 작업을 꺼내 실행**.

### 마이크로태스크 큐(Microtask Queue) vs 태스크 큐(Task Queue)
- 마이크로태스크 큐: `Promise.then()`, `MutationObserver`
- 태스크 큐: `setTimout`, `setInterval`, `fetch`, `I/O 작업`
항상 마이크로태스크 큐가 가장 먼저 실행되고, 그 다음으로 태스크 큐의 작업이 실행됩니다.

### 실행 예제
```javascript
console.log("Start");

setTimeout(() => {
  console.log("setTimeout Callback");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise Callback");
});

console.log("End");
```

### 출력 결과
```javascript
Start
End
Promise Callback
setTimeout Callback
```

### 실행 과정
1. "Start" 실행 -> 출력
2. setTimeout 실행 -> Web API로 보내짐 (0초 후 실행)
3. Promise.then() 실행 -> 마이크로태스크 큐에 추가됨
4. "End" 실행 -> 출력
5. 이벤트 루프가 마이크로태스크 큐의 Promise.then() 실행 -> "Promise Callback" 출력
6. 이벤트 루프가 태스크 큐의 setTimeout 실행 -> "setTimeout Callback" 출력

# JavaScript Memory
1. 콜 스택 (Call Stack): JavaScript가 사용하는 정적 데이터를 저장하는 데이터 구조입니다. 원시값들(string, number, boolean, undefined, null), 객체와 함수를 참조하는 주소, 함수 호출 시 생성되는 실행 컨텍스트를 저장합니다. 엔진은 크기가 변경되지 않는 다는 것을 알고 있기에 각 값들에게 고정된 양의 메모리를 할당하며 실행 직전, 메모리에 할당하는 과정을 **정적 메모리 할당**이라고 합니다.
2. 메모리 힙 (Memory Heap): 객체 및 함수를 저장하며 고정된 양이 아닌 필요에 따른 더 많은 공간을 할당합니다. 저장된 데이터에 메모리를 할당하며 Stack에서 이를 참조합니다.

### 메모리 힙과 이벤트 루프의 관계
1. 비동기 작업이 실행될 때, 필요한 데이터는 메모리 힙에 저장됨.
2. Promise를 사용하면 데이터가 메모리 힙에 남아있다가, 마이크로태스크 큐를 통해 콜백이 실행될 때 참조됨.
3. 메모리 누수(Memory Leak)를 막기 위해, 불필요한 객체는 GC가 자동으로 제거함.

# Garbage Collection(GC)
JavaScript 엔진은 객체가 생성될 때 자동으로 메모리를 할당하고 더 이상 사용하지 않을 때 메모리를 해제합니다. 하지만 GC가 실행되는 시점은 개발자가 직접 컨트롤할 수 없습니다.


### 가비지 컬렉션의 원리
- 참조 카운팅: 어떤 객체가 더 이상 사용되지 않으면 메모리에서 제거.
- 마크 앤 스윕: 도달할 수 없는 객체를찾아 제거.

---

> 자바스크립트의 동작 원리와 흐름에 대해서 정리해보았습니다. 실제로 웹 상에서 작성한 코드가 어떤 흐름으로 실행되는지 적용해 보는데 도움이 될 것 같습니다.

#

## 참고자료

- [<https://wookgu.tistory.com/21>](https://wookgu.tistory.com/21)
- [<https://www.javascripttutorial.net/javascript-call-stack/>](https://www.javascripttutorial.net/javascript-call-stack/)
