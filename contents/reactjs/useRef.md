---
date: '2025-07-02'
series: ''
title: 'react에서 useRef와 변수'
categories: ['ReactJS']
summary: 'useRef 훅의 사용과 let으로 선언한 값을 사용하는 것의 차이'
thumbnail: '../../static/postThumbnails/postThumbnail_250702.png'
---

> 리액트에서 useRef의 역할과 일반 변수와의 차이점에 대하여 알아보자.

---

# useRef
렌더링에 필요하지 않은 값을 참조할 수 있는 React Hook. 컴포넌트의 최상위 레벨에서 호출하여 `ref`를 선언합니다.
```typescript
impor { useRef } from 'react';
const ref = useRef(initialValue)
```
- 매개변수(initialValue): ref 객체의 `current` 프로퍼티 초기 설정값으로 어떤 유형의 값이든 지정할 수 있습니다. 이 인자는 초기 렌더링에만 적용되며 이후 렌더링부터는 무시됩니다.
- 반환값: 단일 프로퍼티 `current`를 가진 객체로 처음 전달한 `initialValue`로 설정됩니다. ref 객체를 JSX 노드의 `ref`어트리뷰트로 전달하면 React는 `current` 프로퍼티를 설정합니다.
### 주의사항
- `ref.current` 프로퍼티는 state와 **달리 변이할 수 있으나**, **렌더링에 사용되는 객체(예: state의 일부)를 포함하는 경우 해당 객체를 변이해서는 안 됩니다.**
- **`ref.current` 프로퍼티를 변경해도 React는 컴포넌트를 다시 렌더링하지 않습니다.** ref는 일반 JavaScript 객체이기 때문에 React는 사용자가 언제 변경했는지 알지 못합니다.
- 초기화를 제외하고는 **렌더링 중에 `ref.current`를 쓰거나 읽으면 안됩니다.** 컴포넌트의 동작을 예측할 수 없기 때문입니다.
- Strict Mode에서 컴포넌트 함수를 두 번 호출하여 의도하지 않은 변경을 찾을 수 있도록 돕는데, 각 ref 객체는 두 번 생성되고 그중 하나는 버리도록 처리되어 컴포넌트 함수가 순수하다면 로직에 영향을 미치지 않는지 확인할 수 있습니다.

# 값 참조하기
`useRef`는 처음에 제공한 초기값으로 설정된 단일 `current`프로퍼티가 있는 객체를 반환합니다.
```typescript
import { useRef } from 'react';

function Stopwatch() {
    const intervalRef = useRef(0);
    // ...
}
```
다음 렌더링에서 동일한 객체를 반환하며, 정보를 저장하고 나중에 읽을 수 있도록 `current`속성을 변경할 수 있습니다.   
**ref를 변경해도 리렌더링을 촉발하지 않습니다.** 즉 ref는 컴포넌트의 시각적 출력에 영향을 미치지 않는 정보를 저장하는데 적합합니다.
```typescript
function handleStartClick() {
    const intervalId = setInterval(() => {
        // ...
    }, 1000)
    intervalRef.current = intervalId;
    clearInterval(intervalId);
}
```
- (렌더링할 때마다 재설정되는 일반 변수와 달리) 리렌더링 사이에 **정보를 저장**할 수 있습니다.
- (리렌더링을 촉발하는 state와 달리) 변경해도 **리렌더링을 촉발하지 않습니다.**
- (정보가 공유되는 외부 변수와 달리) 각각의 컴포넌트에 **로컬로 저장됩니다.**

# 렌더링 중 ref.current의 읽기/쓰기
React는 컴포넌트의 본문이 순수 함수처럼 동작하기를 기대합니다.
- 입력값들(props, state,context)이 동일하면 완전히 동일한 JSX를 반환해야 합니다.
- 다른 순서나 다른 인수를 사용하여 호출해도 다른 호출의 결과에 영향을 미치지 않아야 햡나다.
아래 예시 코드의 경우 이러한 원칙에 위배됩니다.
```typescript
import { useRef } from "react";

function RefTest({ label }) {
  const countRef = useRef(0);
  countRef.current += 1; // ❌ 렌더링 중 ref 변경 (부작용 발생 가능)

  return (
    <div>
      <p>{label}</p>
      <p>렌더링 횟수 (ref): {countRef.current}</p>
    </div>
  );
}
```
```typescript
function App() {
  const [label, setLabel] = useState("Hello");

  return (
    <div>
      <RefTest label={label} />
      <button onClick={() => setLabel("Hello")}>강제 렌더</button>
    </div>
  );
}

```
- 위 코드에서 버튼을 클릭하면, label은 변하지 않지만, setState 호출로 강제로 리렌더링이 일어납니다.
- 이때 `countRef.current += 1`이 실행되기 때문에, 렌더링할 때마다 값이 증가합니다.
```typescript
import { useRef } from "react";

function RefTest({ label }) {
  const countRef = useRef(0);

  // 렌더링 이후에 count를 증가시킴 (부작용 → useEffect 안에서 처리)
  useEffect(() => {
    countRef.current += 1;
  });


  return (
    <div>
      <p>{label}</p>
      <p>렌더링 횟수 (ref): {countRef.current}</p>
    </div>
  );
}
```
위처럼 이벤트 핸들러나 Effect에서 ref를 읽거나 쓰는 것이 React의 순수성과 렌더링 안전성을 준수할 수 있습니다.
> React는 결과보다 타이밍과 예측 가능성을 중시합니다.
> 위 두 가지 예시 코드에서는 결론적으로 같은 리렌더링 횟수를 표시하지만 컴포넌트의 복잡도가 올라가는 경우 렌더링 결과 자체가 `ref` 값에 따라 달라질 수 있습니다.   
> 렌더링 중 변경은 렌더 자체를 오염시킬 위험이 있고,   
> 렌더링 후 변경은 React의 예측 가능한 흐름안에서 처리되므로 안전합니다.

# DOM 조작하기
ref를 사용하여 DOM을 조작하는 것은 특히 일반적입니다.   
초기값이 null인 ref객체를 선언하고 조작하려는 DOM 노드의 JSX에 전달합니다.
```typescript
function myComponent() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return <input ref={inputRef} />;
}
```
React가 DOM 노드를 생성하고 화면에 그린 후, React는 ref 객체의 current 프로퍼티를 DOM 노드로 설정합니다.   
이제 DOM 노드 `<input>`에 접근해 `focus()`와 같은 메서드를 호출할 수 있습니다.   
노드가 화면에서 제거되면 React는 `current`프로퍼티를 다시 `null`로 설정합니다.

# `let`으로 선언한 변수
`let`으로 선언한 변수는 컴포넌트가 **리렌더링 될 때마다 초기화**되어서 이전 값을 잃어버리는 반면,   
`useRef()`로 만든 변수는 **리렌더링 되어도 값이 유지**됩니다.(또한 값이 변경되어도 컴포넌트가 리렌더링을 유발하지 않음)   
따라서 `useRef()`는 주로 **DOM요소에 접근할 때 사용하고 `setTimeout()`이나 `setInterval()`의 ID를 저장할 때도 유용**합니다. 컴포넌트가 리렌더링 되어도 타이머 ID가 유지되어야 `cleanup` 함수에서 해당 값을 이용하여 타이머를 정리할 수 있기 때문입니다.

# 컴포넌트 위부에서 선언한 변수
컴포넌트 외부에서 선언된 변수는 리렌더링의 영향을 받지 않지만 다음과 같은 이유로 권장되지 않는 패턴입니다.
- 컴포넌트 외부의 변수는 모든 컴포넌트 인스턴스가 공유합니다. 따라서 같은 컴포넌트를 여러 번 사용할 때 예상치 못한 동작이 발생할 수 있습니다.
```typescript
// 컴포넌트 외부 변수 (모든 인스턴스가 공유)
let sharedCount = 0;

function Counter() {
  const handleClick = () => {
    sharedCount += 1;
    alert(`공유 카운트: ${sharedCount}`);
  };

  return <button onClick={handleClick}>증가</button>;
}

function App() {
  return (
    <>
      <Counter />
      <Counter />
    </>
  );
}

```
- 전역 변수처럼 동작하기 때문에 코드의 예측 가능성과 유지보수성이 떨어집니다.
```typescript
let isLoggedIn = false;

function LoginToggle() {
  const toggleLogin = () => {
    isLoggedIn = !isLoggedIn;
    alert(`로그인 상태: ${isLoggedIn}`);
  };

  return <button onClick={toggleLogin}>토글 로그인</button>;
}

function StatusMessage() {
  return <p>{isLoggedIn ? "환영합니다!" : "로그인 해주세요."}</p>;
}

function App() {
  return (
    <>
      <LoginToggle />
      <StatusMessage />
    </>
  );
}
```
- React의 원칙 중 하나인 단방향 데이터 흐름에 위배됩니다. 상태 관리가 리액트의 생명주기 밖에서 이루어지기 때문입니다.
```typescript
let counter = 0;

function ExternalCounter() {
  const increase = () => {
    counter += 1;
    alert(`카운터 값: ${counter}`);
  };

  return (
    <>
      <p>카운터 값: {counter}</p>
      <button onClick={increase}>증가</button>
    </>
  );
}
```

---

> 컴포넌트의 상태를 관리할 때는 `useState()`나 `useRef()`와 같은 리액트에서 제공하는 공식적인 방법을 사용하고 생명주기를 잘 지키는 것이 중요합니다.

#

## 참고자료

- [<https://ko.react.dev/reference/react/useRef>](https://ko.react.dev/reference/react/useRef)
