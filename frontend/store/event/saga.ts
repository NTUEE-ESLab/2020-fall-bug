import { PayloadAction } from '@reduxjs/toolkit'
import { eventChannel } from 'redux-saga'
import { takeEvery, take, call, put, fork } from 'redux-saga/effects'
import { normalize } from 'normalizr'
import api, { PageQuery } from '~/api'
import { schema, actions } from '~/store/event/slice'
import { NormalizedEvent } from '~/store/type'
import { isBrowser } from '~/util/env'

const createEventChannel = () =>
  eventChannel((emit) => {
    api.eventChannel.onmessage = (message) => {
      const data = JSON.parse(message.data)
      const { entities, result } = normalize<NormalizedEvent>(data, schema)
      emit(entities?.events?.[result])
    }

    return () => {}
  })

function* subscribeNewEvent() {
  const channel = yield call(createEventChannel)
  while (true) {
    try {
      const event = yield take(channel)
      yield put(actions.addEvent(event))
    } catch {
      // TODO: Add error to reducer
    }
  }
}

function* fetchEvents({ payload }: PayloadAction<PageQuery>) {
  try {
    const data = yield call(api.listEvent, payload)
    const {
      entities: { events },
    } = normalize<NormalizedEvent>(data?.data ?? [], [schema])
    yield put(actions.fetchSuccess(events ?? {}))
  } catch (error) {
    yield put(actions.fetchFailure({ error }))
  }
}

function* saga() {
  yield takeEvery(actions.fetch.type, fetchEvents)
  if (isBrowser()) {
    yield fork(subscribeNewEvent)
  }
}

export default saga
