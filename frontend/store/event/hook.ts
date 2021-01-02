import { shallowEqual, useSelector } from 'react-redux'
import { useInjectReducer, useInjectSaga } from 'redux-injectors'
import {
  makeSelectorFilterInDay,
  makeSelectorEvents,
  makeSelectorEventsInDay,
} from '~/store/event/selector'
import { name, reducer } from '~/store/event/slice'
import saga from '~/store/event/saga'

const wrapInjector = <R>(hook: () => R): (() => R) => () => {
  useInjectReducer({ key: name, reducer })
  useInjectSaga({ key: name, saga })
  return hook()
}

const eventsSelector = makeSelectorEvents()
export const useEvents = wrapInjector(() =>
  useSelector(eventsSelector, shallowEqual),
)

const eventsInDaySelector = makeSelectorEventsInDay()
export const useEventsInDay = wrapInjector(() =>
  useSelector(eventsInDaySelector, shallowEqual),
)

const filterInDaySelector = makeSelectorFilterInDay()
export const useFilterInDay = wrapInjector(() =>
  useSelector(filterInDaySelector, shallowEqual),
)
