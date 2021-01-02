import { createSelector } from 'reselect'
import { name, selectors } from '~/store/device/slice'
import { makeSelectorStatus } from '~/store/selector'

// eslint-disable-next-line import/prefer-default-export
export const makeSelectorDevices = () =>
  createSelector(
    makeSelectorStatus(name, 'fetch'),
    selectors.selectAll,
    (status, devices) => ({
      ...status,
      devices,
    }),
  )
