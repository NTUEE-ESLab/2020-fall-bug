import dayjs from 'dayjs'
import { denormalize } from 'normalizr'
import { createSelector } from 'reselect'
import { name, selectors } from '~/store/event/slice'
import {
  schema as deviceSchema,
  selectors as deviceSelectors,
} from '~/store/device/slice'
import {
  schema as labelSchema,
  selectors as labelSelectors,
} from '~/store/label/slice'
import { makeSelectorStatus } from '~/store/selector'
// Type
import { Event } from '~/store/type'

export const selectFilterInDay = (state: any): number =>
  state[name]?.filterInDay

export const makeSelectorFilterInDay = () =>
  createSelector(selectFilterInDay, (filterInDay) => filterInDay)

export const makeSelectorEvents = () =>
  createSelector(
    makeSelectorStatus(name, 'fetch'),
    selectors.selectAll,
    deviceSelectors.selectEntities,
    labelSelectors.selectEntities,
    (status, events, deviceEntities, labelEntities) => ({
      ...status,
      events: events.map(
        (event) =>
          denormalize(
            event,
            { device: deviceSchema, labels: [labelSchema] },
            { devices: deviceEntities, labels: labelEntities },
          ) as Event,
      ),
    }),
  )

export const makeSelectorEventsInDay = () =>
  createSelector(
    makeSelectorEvents(),
    selectFilterInDay,
    ({ events, ...rest }, filterInDay) => ({
      ...rest,
      filterInDay,
      events: events.filter(({ startedAt }) =>
        dayjs(startedAt).isBetween(
          dayjs(filterInDay),
          dayjs(filterInDay).add(1, 'day'),
        ),
      ),
    }),
  )
