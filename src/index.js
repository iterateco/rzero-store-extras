import createReduxZeroStore from 'redux-zero'

export class StoreContext {
  constructor(key) {
    this.key = key
  }

  get(state) {
    return state[this.getkey]
  }

  set(state, obj) {
    return {
      [this.key]: { ...state[this.key], ...obj }
    }
  }
}

export function createStore(...args) {
  return decorateStore(createReduxZeroStore(...args))
}

export function storeInjectorMiddleware(store) {
  return next => action => {
    return next((...args) => wrapActionResult(store, action(...args)))
  }
}

function decorateStore(store) {
  store.call = (action, ...args) => callAction(store, action, args)
  store.dispatch = (action, ...args) => (
    resolvePromise(callAction(store, action, args), update => {
      if (update != null) store.setState(update)
      return store.getState()
    })
  )
  store.session = (...args) => createSession(store, ...args)
  return store
}

function wrapActionResult(store, result) {
  return resolvePromise(result, result => {
    return typeof result === 'function' ? result(store) : result
  })
}

function callAction(store, action, args) {
  return wrapActionResult(store, action(store.getState(), ...args))
}

function createSession(store, callback) {
  if (callback.then) {
    throw new Error('Asynchronous store sessions are not allowed.')
  }

  const session = createStore(store.getState())

  return resolvePromise(callback(session), update => {
    if (update != null) session.setState(update)
    return session.getState()
  })
}

function resolvePromise(result, callback) {
  return result && result.then
    ? result.then(callback)
    : callback(result)
}
