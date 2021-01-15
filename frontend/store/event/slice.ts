import * as R from 'ramda'
import dayjs from 'dayjs'
import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
  Dictionary,
} from '@reduxjs/toolkit'
import { schema as Schema } from 'normalizr'
import {
  wrapPendingReducer,
  wrapSuccessReducer,
  wrapFailureReducer,
} from '~/store/action'
import { rekeyCamelCase } from '~/util/rekey'
import { NormalizedEvent, NormalizedLabel } from '~/store/type'

export const schema = new Schema.Entity('events', undefined, {
  processStrategy: (value) => {
    const rekeyed = rekeyCamelCase(value)
    rekeyed.device = rekeyed.deviceId
    rekeyed.labels = rekeyed.labels || []
    return R.omit(['deviceId'], rekeyed)
  },
})

const adapter = createEntityAdapter<NormalizedEvent>({
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
    fetchSuccess: wrapSuccessReducer<State, Record<string, NormalizedEvent>>(
      'fetch',
      (state, action) => {
        adapter.addMany(state, action.payload)
      },
    ),
    updateFilterInDay(state, action) {
      state.filterInDay = action.payload.filterInDay
    },
    addEvent(state, action) {
      adapter.addOne(state, action.payload)
    },
    addEventsLabels(
      state,
      action: PayloadAction<Dictionary<NormalizedLabel[]>>,
    ) {
      const updates = Object.entries(action.payload).map(
        ([id, labels]) => ({
          id,
          changes: {
            labels: R.uniq([
              ...(state.entities[id]?.labels ?? []),
              ...(labels?.map((label) => label.id) ?? []),
            ]),
          },
        }),
        {},
      )
      adapter.updateMany(state, updates)
    },
  },
})

export const { name, actions, reducer } = slice
export const selectors = adapter.getSelectors((state: any) => state[name])
