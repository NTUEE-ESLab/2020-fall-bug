import { createSelector } from 'reselect'
import { name, selectors } from '~/store/label/slice'
import { makeSelectorStatus } from '~/store/selector'

// eslint-disable-next-line import/prefer-default-export
export const makeSelectorLabelEntities = () =>
  createSelector(
    makeSelectorStatus(name, 'fetch'),
    selectors.selectEntities,
    (status, labelEntities) => ({
      ...status,
      labelEntities,
    }),
  )
