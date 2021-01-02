import dayjs from 'dayjs'
import { createSelector } from 'reselect'
import { name, selectors } from '~/store/event/slice'
import { makeSelectorStatus } from '~/store/selector'

export const selectFilterInDay = (state: any): number =>
  state[name]?.filterInDay

export const makeSelectorFilterInDay = () =>
  createSelector(selectFilterInDay, (filterInDay) => filterInDay)

export const makeSelectorEvents = () =>
  createSelector(
    makeSelectorStatus(name, 'fetch'),
    selectors.selectAll,
    (status, events) => ({
      ...status,
      events,
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
