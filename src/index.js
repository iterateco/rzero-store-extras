import createReduxZeroStore from 'redux-zero'

export class StateContext {
  constructor(key) {
    this.key = key
  }

  get(state) {
    return state[this.key]
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
  return next => action => next((...args) => {
    return resolvePromise(action(...args), ret => {
      return typeof ret === 'function' ? ret(store) : ret
    })
  })
}

function decorateStore(store) {
  store.dispatch = (action, ...args) => dispatchAction(store, action, args)
  store.session = (...args) => createSession(store, ...args)
  return store
}

function dispatchAction(store, action, args) {
  let ret

  if (typeof store.middleware === "function") {
    ret = store.middleware(store, action, args)
  } else {
    ret = set(store, action(store.getState(), ...args))
  }

  return resolvePromise(ret, () => store.getState())
}

function createSession(store, callback) {
  if (callback.then) {
    throw new Error('Asynchronous store sessions are not allowed.')
  }

  const session = createStore(store.getState(), store.middleware)

  return resolvePromise(callback(session), update => {
    if (update != null) session.setState(update)
    return session.getState()
  })
}

function set(store, ret) {
  if (ret != null) {
    if (ret.then) return ret.then(store.setState)
    store.setState(ret)
  }
}

function resolvePromise(ret, callback) {
  return ret && ret.then
    ? ret.then(callback)
    : callback(ret)
}
