import * as R from 'ramda'
import { PayloadAction } from '@reduxjs/toolkit'
import { takeEvery, call, put } from 'redux-saga/effects'
import { normalize } from 'normalizr'
import { schema, actions } from '~/store/label/slice'
import * as deviceSlice from '~/store/device/slice'
import * as eventSlice from '~/store/event/slice'
import api, { PageQuery } from '~/api'
import { NormalizedLabel } from '~/store/type'

const groupByDeviceId = R.groupBy<NormalizedLabel>(({ device }) => device)

function* createLabel({
  payload,
}: PayloadAction<Parameters<typeof actions.create>[0]>) {
  try {
    const data = yield call(api.createLabel, {
      name: payload.name,
      description: payload.description,
      rule: payload.rule,
      event_kind: payload.event.kind,
      device_id: payload.event.device.id,
    })
    const {
      result,
      entities: { labels },
    } = normalize<NormalizedLabel>(data?.data ?? {}, schema)
    const label = labels?.[result]
    if (label) {
      yield put(actions.createSuccess(label))
      yield put(
        deviceSlice.actions.addDevicesLabels({
          [payload.event.device.id]: [label],
        }),
      )
      yield put(
        eventSlice.actions.addEventsLabels({
          [payload.event.id]: [label],
        }),
      )
    } else {
      throw new Error('failed to receive creation response')
    }
  } catch (error) {
    yield put(actions.createFailure({ error }))
  }
}

function* fetchLabels({ payload }: PayloadAction<PageQuery>) {
  try {
    const data = yield call(api.listLabel, payload)
    const {
      entities: { labels },
    } = normalize<NormalizedLabel>(data?.data ?? [], [schema])
    yield put(actions.fetchSuccess(labels ?? {}))
    yield put(
      deviceSlice.actions.addDevicesLabels(
        groupByDeviceId(Object.values(labels || {})),
      ),
    )
  } catch (error) {
    yield put(actions.fetchFailure({ error }))
  }
}

function* deleteLabel({ payload }: PayloadAction<NormalizedLabel>) {
  try {
    yield call(api.deleteLabel, payload)
    yield put(
      deviceSlice.actions.deleteDevicesLabels({
        [payload.device]: [payload],
      }),
    )
    yield put(actions.deleteSuccess(payload))
  } catch (error) {
    yield put(actions.deleteFailure({ error }))
  }
}

function* saga() {
  yield takeEvery(actions.create.type, createLabel)
  yield takeEvery(actions.fetch.type, fetchLabels)
  yield takeEvery(actions.delete.type, deleteLabel)
}

export default saga
