import dayjs from 'dayjs'
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { Event } from '~/store/type'
import {
  wrapPendingReducer,
  wrapSuccessReducer,
  wrapFailureReducer,
} from '~/store/action'

const adapter = createEntityAdapter<Event>({
  selectId: ({ id }) => id,
  sortComparer: (lhs, rhs) =>
    dayjs(lhs.startedAt).unixMilli() - dayjs(rhs.startedAt).unixMilli(),
})

const initialState = adapter.getInitialState({
  status: {
    fetch: {
      pending: false,
      resolved: false,
      rejected: false,
    },
  },
  filterInDay: dayjs().startOf('day').unixMilli(),
})

type State = typeof initialState

const slice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    fetch: wrapPendingReducer('fetch'),
    fetchFailure: wrapFailureReducer('fetch'),
    fetchSuccess: wrapSuccessReducer<State, Record<string, Event>>(
      'fetch',
      (state, action) => {
        adapter.addMany(state, action.payload)
      },
    ),
    updateFilterInDay(state, action) {
      state.filterInDay = action.payload.filterInDay
    },
  },
})

export const { name, actions, reducer } = slice
export const selectors = adapter.getSelectors((state: any) => state[name])
