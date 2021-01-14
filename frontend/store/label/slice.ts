import * as R from 'ramda'
import { schema as Schema } from 'normalizr'
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import {
  wrapPendingReducer,
  wrapSuccessReducer,
  wrapFailureReducer,
} from '~/store/action'
import { rekeyCamelCase } from '~/util/rekey'
import { CreateLabelReq, DeleteLabelReq } from '~/api/type'
import { NormalizedLabel, Event } from '~/store/type'

export const schema = new Schema.Entity('labels', undefined, {
  processStrategy: (value) => {
    const rekeyed = rekeyCamelCase(value)
    rekeyed.device = rekeyed.deviceId
    return R.omit(['deviceId'], rekeyed)
  },
})

const adapter = createEntityAdapter<NormalizedLabel>({
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
  name: 'label',
  initialState,
  reducers: {
    fetch: wrapPendingReducer('fetch'),
    fetchFailure: wrapFailureReducer('fetch'),
    fetchSuccess: wrapSuccessReducer<State, Record<string, NormalizedLabel>>(
      'fetch',
      (state, action) => {
        adapter.addMany(state, action.payload)
      },
    ),
    create: wrapPendingReducer<
      State,
      Omit<CreateLabelReq, 'event_kind' | 'device_id'> & { event: Event }
    >('create'),
    createFailure: wrapFailureReducer('create'),
    createSuccess: wrapSuccessReducer<State, NormalizedLabel>(
      'create',
      (state, action) => {
        adapter.addOne(state, action.payload)
      },
    ),
    delete: wrapPendingReducer<State, DeleteLabelReq>('delete'),
    deleteFailure: wrapFailureReducer('delete'),
    deleteSuccess: wrapSuccessReducer<State, DeleteLabelReq>(
      'delete',
      (state, action) => {
        adapter.removeOne(state, action.payload.id)
      },
    ),
  },
})

export const { name, actions, reducer } = slice
export const selectors = adapter.getSelectors((state: any) => state[name])
