import { shallowEqual, useSelector } from 'react-redux'
import { useInjectReducer, useInjectSaga } from 'redux-injectors'
import { makeSelectorDevices } from '~/store/device/selector'
import { name, reducer } from '~/store/device/slice'
import saga from '~/store/device/saga'

const wrapInjector = <R>(hook: () => R): (() => R) => () => {
  useInjectReducer({ key: name, reducer })
  useInjectSaga({ key: name, saga })
  return hook()
}

const devicesSelector = makeSelectorDevices()
// eslint-disable-next-line import/prefer-default-export
export const useDevices = wrapInjector(() =>
  useSelector(devicesSelector, shallowEqual),
)
