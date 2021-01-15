import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'
import { name, selectors } from '~/store/device/slice'
import {
  schema as labelSchema,
  selectors as labelSelectors,
} from '~/store/label/slice'
import { makeSelectorStatus } from '~/store/selector'
// Type
import { Device } from '~/store/type'

export const makeSelectorDeviceEntities = () =>
  createSelector(
    makeSelectorStatus(name, 'fetch'),
    selectors.selectEntities,
    (status, deviceEntities) => ({
      ...status,
      deviceEntities,
    }),
  )

export const makeSelectorDevices = () =>
  createSelector(
    makeSelectorStatus(name, 'fetch'),
    selectors.selectIds,
    selectors.selectEntities,
    labelSelectors.selectEntities,
    (status, deviceIds, deviceEntities, labelEntities) => ({
      ...status,
      devices: deviceIds.map(
        (id) =>
          denormalize(
            deviceEntities[id],
            { labels: [labelSchema] },
            { labels: labelEntities },
          ) as Device,
      ),
    }),
  )

export const makeSelectorDevice = () =>
  createSelector(
    makeSelectorStatus(name, 'fetch'),
    selectors.selectById,
    labelSelectors.selectEntities,
    (status, device, labelEntities) => ({
      ...status,
      device: denormalize(
        device,
        { labels: [labelSchema] },
        { labels: labelEntities },
      ) as Device,
    }),
  )
