# React Smart Promise

Easily handle promises in a React component.

## Installation

```sh
npm i react-smart-promise

# yarn
yarn add react-smart-promise
```

## Usage

```jsx
import { usePromise } from "react-smart-promise";

const getData = fetch("/get-data").then(res => res.json());

function App() {
  const [err, data] = usePromise(getData);
  
  if (err) {
    // handle error
  }
  
  return (
    <ul>
      {data.map(item => <li key={item.pid}>{item.name}</li>)}
    </ul>
  );
}
```
