import { takeEvery, call, put } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'
import { normalize, schema } from 'normalizr'
import { actions } from '~/store/event/slice'
import api, { PageQuery } from '~/api'
import { rekeyCamelCase } from '~/util/rekey'

const eventSchema = new schema.Entity('events', undefined, {
  processStrategy: rekeyCamelCase,
})

function* fetchEvents({ payload }: PayloadAction<PageQuery>) {
  try {
    const data = yield call(api.listEvent, payload)
    const {
      result: keys,
      entities: { events: entities },
    } = normalize(data?.data ?? [], [eventSchema])
    yield put(actions.fetchSuccess({ keys, entities }))
  } catch (error) {
    yield put(actions.fetchFailure({ error }))
  }
}

function* saga() {
  yield takeEvery(actions.fetch.type, fetchEvents)
}

export default saga
