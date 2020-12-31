import dayjs from 'dayjs'
import { createSelector } from 'reselect'
import { name } from '~/store/event/slice'
import { Event } from '~/store/type'

const selectStatus = (state: any): { fetching: boolean; error: any } =>
  state[name]?.status

const selectKeys = (state: any): string[] => state[name]?.keys ?? []

const selectEntities = (state: any): { [key: string]: Event } =>
  state[name]?.entities ?? {}

const selectInDay = (state: any): number => state[name]?.filterInDay

export const makeSelectorEvents = () =>
  createSelector(
    selectStatus,
    selectKeys,
    selectEntities,
    (status, keys, entities) => ({
      ...status,
      events: keys.map((key) => entities[key]),
    }),
  )

export const makeSelectorEventsInDay = () =>
  createSelector(
    makeSelectorEvents(),
    selectInDay,
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
