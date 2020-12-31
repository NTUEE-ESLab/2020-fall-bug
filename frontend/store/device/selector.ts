import { createSelector } from 'reselect'
import { name } from '~/store/device/slice'
import { Device } from '~/store/type'

const selectStatus = (state: any): { fetching: boolean; error: any } =>
  state[name]?.status

const selectKeys = (state: any): string[] => state[name]?.keys ?? []

const selectEntities = (state: any): { [key: string]: Device } =>
  state[name]?.entities ?? {}

// eslint-disable-next-line import/prefer-default-export
export const makeSelectorDevices = () =>
  createSelector(
    selectStatus,
    selectKeys,
    selectEntities,
    (status, keys, entities) => ({
      ...status,
      devices: keys.map((key) => entities[key]),
    }),
  )
