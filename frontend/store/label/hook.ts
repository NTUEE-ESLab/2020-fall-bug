import { shallowEqual, useSelector } from 'react-redux'
import { useInjectReducer, useInjectSaga } from 'redux-injectors'
import { makeSelectorStatus } from '~/store/selector'
import { makeSelectorLabelEntities } from '~/store/label/selector'
import { name, reducer } from '~/store/label/slice'
import saga from '~/store/label/saga'

const wrapInjector = <R>(hook: () => R): (() => R) => () => {
  useInjectReducer({ key: name, reducer })
  useInjectSaga({ key: name, saga })
  return hook()
}

const labelEntitiesSelector = makeSelectorLabelEntities()
export const useLabels = wrapInjector(() =>
  useSelector(labelEntitiesSelector, shallowEqual),
)

const createStatusSelector = makeSelectorStatus(name, 'create')
export const useCreateLabelStatus = wrapInjector(() =>
  useSelector(createStatusSelector, shallowEqual),
)

const deleteStatusSelector = makeSelectorStatus(name, 'delete')
export const useDeleteLabelStatus = wrapInjector(() =>
  useSelector(deleteStatusSelector, shallowEqual),
)
