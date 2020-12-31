import { createSlice } from '@reduxjs/toolkit'
import { FetchableState } from '../type'

export type Device = {
  id: string
  name: string
  description: string
}

export const initialState: FetchableState<Event[]> = {
  keys: [],
  entities: {},
  status: {
    fetching: false,
    error: false,
  },
}

const slice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    fetch(state) {
      state.status.fetching = true
      state.status.error = false
    },
    fetchSuccess(state, action) {
      state.keys = action.payload.keys
      state.entities = action.payload.entities
      state.status.fetching = false
    },
    fetchFailure(state, action) {
      state.status.error = action.payload.error
      state.status.fetching = false
    },
  },
})

export const { name, actions, reducer } = slice
