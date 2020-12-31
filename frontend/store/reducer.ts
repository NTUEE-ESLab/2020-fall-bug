import { combineReducers, createSlice } from '@reduxjs/toolkit'

const dummy = createSlice({ name: '_', initialState: {}, reducers: {} })

// eslint-disable-next-line import/prefer-default-export
export const createReducer = (injectedReducers = {}) =>
  combineReducers({
    dummy: dummy.reducer,
    ...injectedReducers,
  })
