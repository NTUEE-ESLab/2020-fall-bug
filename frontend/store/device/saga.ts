import { PayloadAction } from '@reduxjs/toolkit'
import { takeEvery, call, put } from 'redux-saga/effects'
import { normalize } from 'normalizr'
import { schema, actions } from '~/store/device/slice'
import api, { PageQuery } from '~/api'
import { CreateDeviceReq, DeleteDeviceReq } from '~/api/type'
import { NormalizedDevice } from '~/store/type'

function* createDevice({ payload }: PayloadAction<CreateDeviceReq>) {
  try {
    const data = yield call(api.createDevice, payload)
    const {
      result,
      entities: { devices },
    } = normalize<NormalizedDevice>(data?.data ?? [], schema)
    if (devices?.[result]) {
      yield put(actions.createSuccess(devices?.[result]))
    } else {
      throw new Error('failed to receive creation response')
    }
  } catch (error) {
    yield put(actions.createFailure({ error }))
  }
}

function* fetchDevices({ payload }: PayloadAction<PageQuery>) {
  try {
    const data = yield call(api.listDevice, payload)
    const {
      entities: { devices },
    } = normalize<NormalizedDevice>(data?.data ?? [], [schema])
    yield put(actions.fetchSuccess(devices ?? {}))
  } catch (error) {
    yield put(actions.fetchFailure({ error }))
  }
}

function* deleteDevice({ payload }: PayloadAction<DeleteDeviceReq>) {
  try {
    yield call(api.deleteDevice, payload)
    yield put(actions.deleteSuccess(payload))
  } catch (error) {
    yield put(actions.deleteFailure({ error }))
  }
}

function* saga() {
  yield takeEvery(actions.create.type, createDevice)
  yield takeEvery(actions.fetch.type, fetchDevices)
  yield takeEvery(actions.delete.type, deleteDevice)
}

export default saga
