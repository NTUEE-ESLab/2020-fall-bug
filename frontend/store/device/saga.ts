import { takeEvery, call, put } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'
import { normalize, schema } from 'normalizr'
import { actions } from '~/store/device/slice'
import api, { PageQuery } from '~/api'
import { rekeyCamelCase } from '~/util/rekey'

const deviceSchema = new schema.Entity('devices', undefined, {
  processStrategy: rekeyCamelCase,
})

function* fetchDevices({ payload }: PayloadAction<PageQuery>) {
  try {
    const data = yield call(api.listDevice, payload)
    const {
      result: keys,
      entities: { devices: entities },
    } = normalize(data?.data ?? [], [deviceSchema])
    yield put(actions.fetchSuccess({ keys, entities }))
  } catch (error) {
    yield put(actions.fetchFailure({ error }))
  }
}

function* saga() {
  yield takeEvery(actions.fetch.type, fetchDevices)
}

export default saga
