import dayjs from 'dayjs'
import { createSlice } from '@reduxjs/toolkit'
import { FetchableState, Event } from '~/store/type'

type EventState = {
  filterInDay: number | undefined
}

export const initialState: FetchableState<Event, EventState> = {
  keys: [],
  entities: {},
  status: {
    fetching: false,
    error: false,
  },
  filterInDay: dayjs().startOf('day').unixMilli(),
}

const slice = createSlice({
  name: 'event',
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
    updateFilterInDay(state, action) {
      state.filterInDay = action.payload.filterInDay
    },
  },
})

export const { name, actions, reducer } = slice
