# rzero-store-extras
Supercharged [redux-zero](https://github.com/concretesolutions/redux-zero) store

- Export individual actions with access to the store
- Dispatch actions from within actions
- Easily work with nested state

## Example

### store.js
```javascript
import { createStore, storeInjectorMiddleware } from 'rzero-store-extras'

const initialState = {
  counters: {
    a: 0,
    b: 0
  }
}

const middleware = applyMiddleware([storeInjectorMiddleware])

export default createStore(initialState, middleware)
```

### actions.js
```javascript
import { StateContext } from 'rzero-store-extras'

const context = new StateContext('counters')

export const incrementCounterA = (state, amount) => {
  const { a } = context.get(state)
  return context.set(state, { a: a + amount })
}

export const incrementCounterB = (state, amount) => {
  const { b } = context.get(state)
  return context.set(state, { b: b + amount })
}

export const incrementAllCounters = (state, amount) => store => {
  store.dispatch(incrementCounterA, amount)
  store.dispatch(incrementCounterB, amount)
}

export const incrementAllCountersOptimized = (state, amount) => store => {
  // Create a temporary copy of the store that will aggregate all
  // state updates, so that subscribers are only updated once.
  return store.session(session => {
    session.dispatch(incrementCounterA, amount)
    session.dispatch(incrementCounterB, amount)
  })
}
```
