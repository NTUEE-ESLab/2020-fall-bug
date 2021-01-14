import * as R from 'ramda'
import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
  Dictionary,
} from '@reduxjs/toolkit'
import { schema as Schema } from 'normalizr'
import { NormalizedDevice, NormalizedLabel } from '~/store/type'
import {
  wrapPendingReducer,
  wrapSuccessReducer,
  wrapFailureReducer,
} from '~/store/action'
import { CreateDeviceReq, DeleteDeviceReq } from '~/api/type'
import { rekeyCamelCase } from '~/util/rekey'

export const schema = new Schema.Entity('devices', undefined, {
  processStrategy: (value) => {
    const rekeyed = rekeyCamelCase(value)
    rekeyed.labels = []
    return rekeyed
  },
})

const adapter = createEntityAdapter<NormalizedDevice>({
  selectId: ({ id }) => id,
})

const initialState = adapter.getInitialState({
  status: {
    fetch: {
      pending: false,
      resolved: false,
      rejected: false,
    },
    create: {
      pending: false,
      resolved: false,
      rejected: false,
    },
    delete: {
      pending: false,
      resolved: false,
      rejected: false,
    },
  },
})

type State = typeof initialState

const slice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    fetch: wrapPendingReducer('fetch'),
    fetchFailure: wrapFailureReducer('fetch'),
    fetchSuccess: wrapSuccessReducer<State, Record<string, NormalizedDevice>>(
      'fetch',
      (state, action) => {
        adapter.addMany(state, action.payload)
      },
    ),
    create: wrapPendingReducer<State, CreateDeviceReq>('create'),
    createFailure: wrapFailureReducer('create'),
    createSuccess: wrapSuccessReducer<State, NormalizedDevice>(
      'create',
      (state, action) => {
        adapter.addOne(state, action.payload)
      },
    ),
    delete: wrapPendingReducer<State, DeleteDeviceReq>('delete'),
    deleteFailure: wrapFailureReducer('delete'),
    deleteSuccess: wrapSuccessReducer<State, DeleteDeviceReq>(
      'delete',
      (state, action) => {
        adapter.removeOne(state, action.payload.id)
      },
    ),
    addDevicesLabels(
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
    deleteDevicesLabels(
      state,
      action: PayloadAction<Dictionary<NormalizedLabel[]>>,
    ) {
      const updates = Object.entries(action.payload).map(([id, labels]) => {
        const deleteSet = new Set(labels?.map((label) => label.id))
        return {
          id,
          changes: {
            labels: (state.entities[id]?.labels ?? []).filter(
              (label) => !deleteSet.has(label),
            ),
          },
        }
      }, {})
      adapter.updateMany(state, updates)
    },
  },
})

export const { name, actions, reducer } = slice
export const selectors = adapter.getSelectors((state: any) => state[name])
