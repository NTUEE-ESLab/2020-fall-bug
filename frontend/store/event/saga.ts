import { PayloadAction } from '@reduxjs/toolkit'
import { takeEvery, call, put } from 'redux-saga/effects'
import { normalize, schema } from 'normalizr'
import api, { PageQuery } from '~/api'
import { actions } from '~/store/event/slice'
import { Event } from '~/store/type'
import { rekeyCamelCase } from '~/util/rekey'

const eventSchema = new schema.Entity('events', undefined, {
  processStrategy: rekeyCamelCase,
})

function* fetchEvents({ payload }: PayloadAction<PageQuery>) {
  try {
    const data = yield call(api.listEvent, payload)
    const {
      entities: { events },
    } = normalize<Event>(data?.data ?? [], [eventSchema])
    yield put(actions.fetchSuccess(events ?? {}))
  } catch (error) {
    yield put(actions.fetchFailure({ error }))
  }
}

function* saga() {
  yield takeEvery(actions.fetch.type, fetchEvents)
}

export default saga
