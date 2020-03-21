<img src='https://github.com/erictooth/react-smart-promise/raw/master/media/react-smart-promise.png' height='75' width='431' alt='React Smart Promise' />

Hook for dealing with promises in React components

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/erictooth/react-smart-promise/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/react-smart-promise.svg?style=flat-square)](https://www.npmjs.com/package/react-smart-promise) ![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square) ![typescript coverage](https://img.shields.io/badge/typescript%20coverage-100%25-brightgreen) ![bundle size](https://badgen.net/bundlephobia/minzip/react-smart-promise@latest)


## ✨ Features
- 📦 Works with any code or library that uses promises
- 🌬 Customizable cancelation for libaries like [Axios](https://github.com/axios/axios#cancellation) and native `fetch`
- 🎯 Complete TypeScript generics for automatic inference of promise result type
- 🔄 Multiple re-fetch modes (`every`, `latest`) for scenarios like typeahead search or debounced inputs
- ⚡️ Fully customizable for pagination, optimistic updates, infinite scroll, polling, etc.
- 🐜 Tiny yet powerful — less than 1kb gzipped

## Example
```jsx
import axios from "axios";
import { usePromise } from "react-smart-promise";

const fetchUsers = () => axios.get("/users");

function App() {
    const [err, users, status] = usePromise(fetchUsers);

    if (err) {
      return "Error fetching users.";
    }
    
    if (!users) {
        return "Loading...";
    }

    return <ul>
      {users.map(user => <li>{user.name}</li>)}
    </ul>;
}
```

## API
`const [error, data, status] = usePromise(options);`

### `options`
```ts
{
  mode?: "latest" | "every", // (default: "latest")
  onCancel?: (promise: Promise<T>) => void, // (default: void)
}
```

#### `mode`
Determines whether to show only the most recent promise (`latest`) or to show the most recently resolved promise in the queue (`every`). A typical usecase for every is when implementing an “auto-complete” search, where you want to show the latest result as they stream in.

#### `onCancel`
Although `usePromise` will cancel the promise out of the box, it can be helpful to integrate cancelation more deeply when using libraries like Axios. The function you provide will be called whenever `usePromise` determines cancelation is needed (such as during unmount, changing the promise before the first one has completed, etc.)

##### Example (Axios)
You need a way to reference the cancel function from Axios's `CancelToken`. One common way to approach this is to add a `.cancel` method to the promise returned by Axios:

```js
import Axios, { CancelToken } from "axios";

const getUsers = () => {
    const source = CancelToken.source();
    const promise = axios.get("/users", { cancelToken: source.token }).then(res => res.data);
    promise.cancel = () => source.cancel();
    return promise;
}
```
You can then call it in the cancel option for usePromise:

```js
usePromise(getUsers, {
    cancel: promise => promise.cancel();
});
```

If you wrap all of your Axios promises this way and often use usePromise throughout your app, it can be helpful to preconfigure this option:

```js
import { usePromise } from "react-promise-switch";

export const useAxiosPromise = (fn, options) => usePromise(fn, { 
    cancel: axiosPromise => axiosPromise.cancel(), 
    ...options 
});
```

## More Examples

### Waiting to Fetch Data

Sometimes you don't want to trigger the promise right away, but instead want to wait until some action has occurred. You can pass `null` to `usePromise` and it will remain in the `"INITIAL"` state:

```jsx
const submitData = () => axios.post("/register", { id: 1 });

function App() {
    const [submitted, setSubmitted] = React.useState(false);
    const [err, result, status] = usePromise(submitted ? submitData : null);

    return <button onClick={() => setSubmitted(true)} disabled={STATUS === "PENDING"}>Submit</button>;
}
```

### Providing Arguments

Sometimes you may want to pass arguments to the function provided to `usePromise`. You should wrap the function call with a `React.useCallback` so that it only re-fetches when the arguments change.

```jsx
const getUser = (id) => axios.get("/users", {id});

function SelectUser() {
    const [userId, setUserId] = React.useState("1");
    const [err, user] = usePromise(React.useCallback(() => getUser(userId), [userId]))
    
    return (
        <div>
            <UserSelector id={userId} onChange={setUserId} />
            <UserProfile user={user} />;
        </div>
    );
}
```

### Handling Side Effects

If you need to handle side effects after the state of the promise changes, you can use `React.useEffect`.

```jsx
const submitForm = (formState) => axios.post("/submit", formState);

function FormContainer() {
    const [submitted, setSubmitted] = React.useState(false);
    const [formState, setFormState] = React.useState({});
    const [formErrors, successful, status] = usePromise(submitted ? React.useCallback(() => submitForm(formState), [formState]) : null);
    
    React.useEffect(() => {
        if (successful) {
            window.location = "/";
        }
    }, [successful]);
    
    return <Form value={formState} onChange={setFormState} onSubmit={() => setSubmitted(true)} errors={formErrors} />
}
```
