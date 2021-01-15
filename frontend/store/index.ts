import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { createInjectorsEnhancer, forceReducerReload } from 'redux-injectors'
import createSagaMiddleware from 'redux-saga'
import { createReducer } from '~/store/reducer'
import config from '~/config'

// eslint-disable-next-line import/prefer-default-export
export const createStore = (initialState = {}) => {
  const sagaMiddleware = createSagaMiddleware()
  const { run: runSaga } = sagaMiddleware

  const middleware = [...getDefaultMiddleware({ thunk: false }), sagaMiddleware]

  const enhancers = [
    createInjectorsEnhancer({
      createReducer,
      runSaga,
    }),
  ]

  const store = configureStore({
    reducer: createReducer(),
    devTools: config.dev,
    preloadedState: initialState,
    middleware,
    enhancers,
  })

  if (module.hot) {
    module.hot.accept('./reducer', () => {
      forceReducerReload(store)
    })
  }

  return store
}
