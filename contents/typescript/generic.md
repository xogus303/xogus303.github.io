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
이때 위처럼 제네릭 인터페이스를 사용하여 변수의 타입으로 지정할 수 있습니다.
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
인자의 타입에 선언한 T의 타입을 구체적으로 정의하지 않는 경우 위처럼 오류가 발생합니다.
```typescript
interface LengthWise {
  length: number;
}
function logText<T extends LengthWise>(text: T): T {
  console.log(text.length);
}
```
이 때 위와 같이 T의 타입을 extends를 이용하여 제네릭 인터페이스와 함께 설정하는 경우, 타입을 지정하지 않고 length 속성을 허용하는 동시에 length 속성이 있는 값만 인자로 허용하는 역할을 합니다.
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
위 type P의 ReturnType<f>에서 에러가 발생하는 이유는 값을 반환 타입으로 사용하였기 때문 입니다. 값과 타입은 같지 않으며, 값 f의 타입을 추론하기 위해서 `typeof`를 사용해야 합니다.
```typescript
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<typeof f>; // P = { x: number, y: number };
```

# 강제 타입 캐스팅
아래는 객체를 매개변수로 받아 해당 객체의 키값들을 배열로 반환하는 함수 입니다. `Object.keys()`의 반환 타입은 항상 `string[]`입니다. 그러나 `keyof TObj`는 `string`, `number`, `symbol`의 유니언 타입일 수 있고, 특히 제네릭 `TObj`가 비어 있으면 `keyof TObj`는 `never`타입이 되기도 하기 때문에 상호 호환성이 없어 타입 오류가 발생합니다.
```typescript
const typedObjectKeys = <TObj extends {}>(obj: TObj): Array<keyof TObj> => {
  return Object.keys(obj); // Erorr: string[]은 keyof TObj[]에 할당 불가
}
```
가장 흔한 해결 방안으로 `as`단언을 사용하여 강제 타입 캐스팅을 해주는 방법입니다.
```typescript
const typedObjectKeys = <TObj extends {}>(obj: TObj): Array<keyof TObj> => {
  return Object.keys(obj) as Array<keyof TObj>;
}
```
`Object.keys(obj)`는 런타임에서는 문제가 없고, 실제로 `keyof TObj`의 값만 반환되기 때문에 타입 단언이 합리적인 방법입니다.

# 제네릭 사용 예시
### 1. 반환값의 유형 주입
```typescript
const makeFetch = <TData>(url: string): Promise<TData> => {
  return fetch(url).then((res) => res.json());
};

makeFetch<{ firstName: string; lastName: string }>(
  "/api/endpoin"
).then((res) => {
  console.log(res);
});
```
fetch를 통한 통신의 응답값을 고정하지 않고 제네릭을 통해 유연하게 반환할 수 있습니다. `makeFetch` 함수를 실행하는 시점에 반환 값에 대한 타입을 주입하여 다양한 곳에서 사용할 수 있습니다.   
### 2. 인수에 따른 반환 타입 추론
아래 함수는 두번째 매개변수 `key`를 사용하여 첫번째 매개변수 `obj`의 해당 키의 값을 반환하는 함수입니다.
매개변수의 타입이 `unknown`으로 되어있어 오류가 발생합니다.
```typescript
const getValue = (obj: unknown, key: keyof unknown) => {
  return obj[key]; // 'obj'는 unknown 형식입니다.
};

const result = getValue(
  { a: 1, b: 'some-string'},
  "b", // "b" 형식의 인수는 'never' 형식의 매개 변수에 할당될 수 없습니다.
)
```
따라서 아래와 같이 제네릭을 설정하면 `key` 매개변수를 `TObj`의 키값으로 인덱싱할 수 있습니다.
`getValue`의 두번째 인수로 'a', 'b'를 사용할 수 있고 이외에는 오류가 발생하여 문제가 없습니다.
하지만 현재 getValue의 반환값이 `string | number`로 유니온 형태가 되어 두번째 인수에 따른 정확한 반환값을 얻지 못합니다.
```typescript
const getValue = <TObj extends object>(obj: TObj, key: keyof TObj) => {
  return obj[key];
};

const result = getValue(
  { a: 1, b: 'some-string'},
  "b",
); // (obj: { a: number; b: string }, key: "b" | "a") => string | number
```
TObj의 키값으로 타입을 제한하는 `TKey`제네릭을 추가하여 두번째 매개변수 `key`의 타입으로 설정하게되면 두번째 매개변수로 전달한 인수에 따라 정확한 반환값의 타입을 얻을 수 있습니다.
```typescript
const getValue = <TObj extends object, TKey extends keyof TObj>(obj: TObj, key: TKey) => {
  return obj[key];
};

const result = getValue(
  { a: 1, b: 'some-string'},
  "a",
); // (obj: { a: number; b: string }, key: "a") => number
const result2 = getValue(
  { a: 1, b: 'some-string'},
  "b",
); // (obj: { a: number; b: string }, key: "b") => string
```
### 3. 런타임 타입 검증
아래 함수는 현재 제네릭 `TData`를 받아 fetch에 대한 결과 값을 반환하고, `makeZodSafeFetch()`에서 결과값에 대한 타입 유형을 주입하였습니다. 하지만 실제 반환되는 값이 `{ firstName: string; lastName: string }`의 형태라는 것을 보장할 수는 없습니다.
```typescript
const makeZodSafeFetch = <TData extends object>(url: string): Promise<TData> => {
  return fetch(url).then((res) => res.json());
}

makeZodSafeFetch<{ firstName: string; lastName: string}>(
  "/api/endpoint"
).then((res) => {
  console.log(res)
})
```
런타임에서 반환되는 값의 유효성을 검사하기 위해 zod 라이브러리를 사용합니다. 함수의 두번째 인자로 `schema`를 추가하고 실행하는 부분에서 `z.object`를 알맞은 형태로 넣어줍니다. 이제 `makeZodSafeFetch`함수는 fetch의 응답값이 `schema`형태에 알맞는지 검증하고 해당값 또는 오류를 반환할 수 있습니다. 따라서  `try/catch`를 활용하여 예외처리 할 수 있습니다.
```typescript
import { z } from 'zod';

const makeZodSafeFetch = <TData extends object>(url: string, schema: z.Schema): Promise<TData> => {
  return fetch(url)
  .then((res) => res.json())
  .then((res) => {
    return schema.parse(res);
  })
}

try {
  makeZodSafeFetch<{ firstName: string; lastName: string}>(
    "/api/endpoint",
    z.object({
      firstName: z.string(),
      lastName: z.string(),
    })
  ).then((res) => {
    console.log(res)
  })
} catch (err){
    if (err instanceof z.ZodError){
      console.error("스키마 유효성 검사 실패", err.errors)
    } else {
      console.error("기타 에러", err)
    }
}
```
현재 코드상으로 `makeZodSafeFetch` 실행 부분에서 응답값에 대한 타입 주입이 제네릭과 두번째 인자값으로 이중으로 이뤄지고 있습니다. 타입 유형을 변경하려면 두 가지 모두 수정해야 합니다.
```typescript
  makeZodSafeFetch<{ firstName: string; lastName: string}>(
    "/api/endpoint",
    z.object({
      firstName: z.string(),
      lastName: z.string(),
    })
  )
```
이를 개선하기 위해 `schema: z.Schema<TData>`과 같이 제네릭을 설정하게 되면 `schema`의 값만을 통하여 타입 추론이 가능하게 됩니다.
```typescript
const makeZodSafeFetch = <TData extends object>(url: string, schema: z.Schema<TData>): Promise<TData> => {
  return fetch(url)
  .then((res) => res.json())
  .then((res) => {
    return schema.parse(res);
  })
}
makeZodSafeFetch(
  "/api/endpoint",
  z.object({
    firstName: z.string(),
    lastName: z.string(),
  })
)
```

---

> 제네릭은 함수의 매개변수와 반환값, 클래스의 속성과 메소드 등 다양한 곳에서 값의 타입을 동적으로 사용할 수 있도록 도와줍니다. `interface`를 통해 가독성을 높일 수 있고 `extends`와 `keyof`, `typeof`와 함께 사용하면 커스텀된 제약조건을 설정하여 타입을 제한하고 재사용 가능한 코드를 작성할 수 있게 합니다. 

#

## 참고자료

- [<https://joshua1988.github.io/ts/guide/generics.html#%EC%A0%9C%EB%84%A4%EB%A6%AD-%ED%83%80%EC%9E%85-%EB%B3%80%EC%88%98>](https://joshua1988.github.io/ts/guide/generics.html#%EC%A0%9C%EB%84%A4%EB%A6%AD-%ED%83%80%EC%9E%85-%EB%B3%80%EC%88%98)
- [<https://www.typescriptlang.org/ko/docs/handbook/2/generics.html>](https://www.typescriptlang.org/ko/docs/handbook/2/generics.html)
- [<https://inpa.tistory.com/entry/TS-%F0%9F%93%98-%ED%83%80%EC%9E%85%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Generic-%ED%83%80%EC%9E%85-%EC%A0%95%EB%B3%B5%ED%95%98%EA%B8%B0>](https://inpa.tistory.com/entry/TS-%F0%9F%93%98-%ED%83%80%EC%9E%85%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Generic-%ED%83%80%EC%9E%85-%EC%A0%95%EB%B3%B5%ED%95%98%EA%B8%B0)
- [<https://www.youtube.com/watch?app=desktop&v=dLPgQRbVquo&t=261s&ab_channel=MattPocock>](https://www.youtube.com/watch?app=desktop&v=dLPgQRbVquo&t=261s&ab_channel=MattPocock)
