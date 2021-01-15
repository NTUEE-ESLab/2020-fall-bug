import { createSelector } from 'reselect'
import { AsyncState } from '~/store/type'

// eslint-disable-next-line import/prefer-default-export
export const makeSelectorStatus = (name: string, key: string) =>
  createSelector(
    (state: Record<string, AsyncState<any>>) => state[name]?.status?.[key],
    (status) => status,
  )
