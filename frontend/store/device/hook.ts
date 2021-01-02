import { shallowEqual, useSelector } from 'react-redux'
import { useInjectReducer, useInjectSaga } from 'redux-injectors'
import { makeSelectorStatus } from '~/store/selector'
import { makeSelectorDevices } from '~/store/device/selector'
import { name, reducer } from '~/store/device/slice'
import saga from '~/store/device/saga'

const wrapInjector = <R>(hook: () => R): (() => R) => () => {
  useInjectReducer({ key: name, reducer })
  useInjectSaga({ key: name, saga })
  return hook()
}

const devicesSelector = makeSelectorDevices()
export const useDevices = wrapInjector(() =>
  useSelector(devicesSelector, shallowEqual),
)

const createStatusSelector = makeSelectorStatus(name, 'create')
export const useCreateDeviceStatus = wrapInjector(() =>
  useSelector(createStatusSelector, shallowEqual),
)

const deleteStatusSelector = makeSelectorStatus(name, 'delete')
export const useDeleteDeviceStatus = wrapInjector(() =>
  useSelector(deleteStatusSelector, shallowEqual),
)
