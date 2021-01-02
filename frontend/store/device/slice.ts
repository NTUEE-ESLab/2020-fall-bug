import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import { Device } from '~/store/type'
import {
  wrapPendingReducer,
  wrapSuccessReducer,
  wrapFailureReducer,
} from '~/store/action'
import { CreateDeviceReq, DeleteDeviceReq } from '~/api/type'

const adapter = createEntityAdapter<Device>({
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
    fetchSuccess: wrapSuccessReducer<State, Record<string, Device>>(
      'fetch',
      (state, action) => {
        adapter.addMany(state, action.payload)
      },
    ),
    create: wrapPendingReducer<State, CreateDeviceReq>('create'),
    createFailure: wrapFailureReducer('create'),
    createSuccess: wrapSuccessReducer<State, Device>(
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
  },
})

export const { name, actions, reducer } = slice
export const selectors = adapter.getSelectors((state: any) => state[name])
