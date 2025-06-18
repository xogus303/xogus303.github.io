---
date: '2025-06-18'
series: ''
title: 'Generic 타입이란'
categories: ['Typescript']
summary: 'generic이 무엇이고 언제 사용하는지 정확히 파악해보자'
thumbnail: '../../static/postThumbnails/postThumbnail_250618.png'
---

> C#과 Java 같은 언어에서, 재사용 가능한 컴포넌트를 생성하는 도구상자의 주요 도구 중 하나는 제네릭 입니다. 즉 고정된 단일 타입이 아닌 다양한 타입에서 작동하는 컴포넌트를 작성할 수 있도록 타입을 변수처럼 사용할 수 있게 합니다.

---

# 제네릭의 예시

```typescript
function getText<T>(text: T): T {
  return text;
}
```
위 함수는 제네릭의 기본 문법이 적용된 형태입니다. 해당 함수를 호출할 때 아래와 같이 함수 안에서 사용할 타입을 넘겨줄 수 있습니다.
```typescript
getText<string>('hi');
getText('Hello World');
getText<number>(10);
getText<boolean>(true);
```
위 실행 코드 중 getText<string>('hi')와 getText('Hello World')를 호출 했을 때 함수는 아래와 같이 동작합니다.
```typescript
function getText<string>(text: string): string {
  return text;
}
```
실행코드 getText('Hello World')의 경우 실행함수명 뒤에 타입을 주입하지 않았음에도 인수의 값을 통해 타입을 자동으로 추론합니다. 인수 추론은 코드를 간결하고 가독성 있게 하는데 있어 유용하지만 더 복잡한 예제에서 컴파일러가 타입을 유추할 수 없는 경우 명시적인 타입 인수 전달이 필요할 수도 있습니다.

# 제네릭 인터페이스와 클래스
```typescript
function logText<T>(text: T): T {
  return text;
}

let str1: <T>(text: T) => T = logText;
let str2: {<T>(text: T): T} = logText;
```
변수에 함수를 할당할 때 함수의 타입을 단언해줄 수 있습니다.
```typescript
interface GenericLogTextFn {
  <T>(text: T): T;
}
function logText<T>(text: T): T {
  return text;
}

let myString: GenericLogTextFn = logText;
```
이때 위처럼 제네릭 인터페이스를 변수의 타입으로 지정할 수 있습니다.
```typescript
class GenericMath<T> {
  pi: T;
  sum: (x: T, y: T) => T;
}

let math = new GenericMath<number>();
```
클래스에서도 동일하게 제네릭을 적용하여 기본적으로 타입을 유연하게 받을 수 있습니다.

# 제네릭 제약 조건
```typescript
function logText<T>(text: T): T {
  console.log(text.length); // Error: T doesn't have .length
}
```
인자의 타입에 선언한 T의 타입을 구체적으로 정의하지 않았기 때문에 위처럼 오류가 발생합니다.
```typescript
interface LengthWise {
  length: number;
}
function logText<T extends LengthWise>(text: T): T {
  console.log(text.length);
}
```
이 때 위와 같이 T의 타입을 extends를 이용하여 제네릭 인터페이스 설정하는 경우 타입을 지정하지 않고 length 속성을 허용하는 동시에 length 속성이 있는 값만 인자로 허용하는 역할을 합니다.
```typescript
logText(10); // Error, 숫자 타입에는 `length` 속성이 존재하지 않음
logText({ length: 0, value: 'hi' }); // `text.length` 코드는 객체의 속성 접근과 같이 동작하므로 오류가 발생하지 않습니다.
```
```typescript
function getProperty<T, O extends keyof T>(obj: T, key: O) {
  return obj[key];
}
let obj = { a: 1, b: 2, c: 3 };

getProperty(obj, "a"); // okay
getProperty(obj, "z"); // error: "z"는 obj의 속성에 해당하지 않음
```
제네릭 선언 시 extends와 함께 keyof T를 사용하게되면 T객체에 존재하는 속성들로 타입을 제한할 수 있습니다.
```typescript
let s = "hello";
let n: typeof s; // n: string
```
`typeof`를 사용하여 많은 패턴을 편리하게 표현할 수 있습니다. 아래와 같이 `ReturnType<T>를 사용하면 함수 타입을 받으면서 반환되는 타입을 제공합니다.
```typescript
type Predicate = (x: unknown) => boolean;
type K = ReturnType<Predicate>; // K = boolean

function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<f>; // Error: `f`는 값을 참조하지만 유형으로 사용됩니다.
```
위 type P의 ReturnType<f>에서 에러는 값과 타입은 같지 않으며, 값 f의 타입을 추론하기 위해서 `typeof`를 사용해야 합니다.
```typescript
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<typeof f>; // P = { x: number, y: number };
```



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

- [<https://joshua1988.github.io/ts/guide/generics.html#%EC%A0%9C%EB%84%A4%EB%A6%AD-%ED%83%80%EC%9E%85-%EB%B3%80%EC%88%98>](https://joshua1988.github.io/ts/guide/generics.html#%EC%A0%9C%EB%84%A4%EB%A6%AD-%ED%83%80%EC%9E%85-%EB%B3%80%EC%88%98)
- [<https://www.typescriptlang.org/ko/docs/handbook/2/generics.html>](https://www.typescriptlang.org/ko/docs/handbook/2/generics.html)
- [<https://inpa.tistory.com/entry/TS-%F0%9F%93%98-%ED%83%80%EC%9E%85%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Generic-%ED%83%80%EC%9E%85-%EC%A0%95%EB%B3%B5%ED%95%98%EA%B8%B0>](https://inpa.tistory.com/entry/TS-%F0%9F%93%98-%ED%83%80%EC%9E%85%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Generic-%ED%83%80%EC%9E%85-%EC%A0%95%EB%B3%B5%ED%95%98%EA%B8%B0)
