import { shallowEqual, useSelector } from 'react-redux'
import { useInjectReducer, useInjectSaga } from 'redux-injectors'
import { makeSelectorStatus } from '~/store/selector'
import {
  makeSelectorDeviceEntities,
  makeSelectorDevices,
  makeSelectorDevice,
} from '~/store/device/selector'
import { name, reducer } from '~/store/device/slice'
import * as labelSlice from '~/store/label/slice'
import saga from '~/store/device/saga'
// Type
import { AsyncState } from '~/store/type'

const wrapInjector = <H extends (...args: any[]) => any>(hook: H) => (
  ...args: Parameters<H>
): ReturnType<H> => {
  useInjectReducer({ key: name, reducer })
  useInjectSaga({ key: name, saga })
  useInjectReducer({ key: labelSlice.name, reducer: labelSlice.reducer })
  return hook(...args)
}

const deviceEntitiesSelector = makeSelectorDeviceEntities()
export const useDeviceEntities = wrapInjector(() =>
  useSelector(
    (state: Record<string, AsyncState<any, {}>>) =>
      deviceEntitiesSelector(state),
    shallowEqual,
  ),
)

const devicesSelector = makeSelectorDevices()
export const useDevices = wrapInjector(() =>
  useSelector(devicesSelector, shallowEqual),
)

const deviceSelector = makeSelectorDevice()
export const useDevice = wrapInjector((id: string) =>
  useSelector(
    (state: Record<string, AsyncState<any, {}>>) => deviceSelector(state, id),
    shallowEqual,
  ),
)

const createStatusSelector = makeSelectorStatus(name, 'create')
export const useCreateDeviceStatus = wrapInjector(() =>
  useSelector(createStatusSelector, shallowEqual),
)

const deleteStatusSelector = makeSelectorStatus(name, 'delete')
export const useDeleteDeviceStatus = wrapInjector(() =>
  useSelector(deleteStatusSelector, shallowEqual),
)
