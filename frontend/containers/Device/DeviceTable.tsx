import React, { useCallback, useEffect, useState, memo } from 'react'
import { useDispatch } from 'react-redux'
import { useDisclosure, Heading, Skeleton } from '@chakra-ui/react'
// Hook
import { useDidMount } from 'beautiful-react-hooks'
import {
  actions as deviceActions,
  useDevices,
  useCreateDeviceStatus,
  useDeleteDeviceStatus,
} from '~/store/device'
import { actions as labelActions, useLabels } from '~/store/label'
import useBool from '~/hook/useBool'
// Component
import DeviceTable from '~/components/Device/DeviceTable'
import CreateDeviceModal from '~/components/Device/Modal/CreateDevice'
import DeleteDeviceModal from '~/components/Device/Modal/DeleteDevice'
// Type
import { Device } from '~/store/type'

const DeviceTableContainer = () => {
  const dispatch = useDispatch()
  // Global state
  const { devices, pending: deviceFetching } = useDevices()
  const { pending: labelFetching } = useLabels()
  const { pending: deleting, resolved: deleted } = useDeleteDeviceStatus()
  const { pending: creating, resolved: created } = useCreateDeviceStatus()
  // Local state
  const [inited, setInited] = useBool()
  const fetching = deviceFetching || labelFetching
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure()
  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure()
  const [targetDevice, setTargetDevice] = useState<Device>()
  // Event
  const onDeviceCreateConfirm = useCallback(
    (newDevice: { name: string; description: string }) => {
      dispatch(deviceActions.create(newDevice))
    },
    [dispatch],
  )
  const onDeviceDelete = useCallback(
    (device: Device) => {
      onDeleteModalOpen()
      setTargetDevice(device)
    },
    [onDeleteModalOpen, setTargetDevice],
  )
  const onDeviceDeleteConfirm = useCallback(() => {
    if (targetDevice) {
      dispatch(deviceActions.delete({ id: targetDevice.id }))
    }
  }, [dispatch, targetDevice])
  // Effect
  useDidMount(() => {
    if (!inited) {
      if (!deviceFetching) {
        dispatch(deviceActions.fetch({}))
      }
      if (!labelFetching) {
        dispatch(labelActions.fetch({}))
      }
      setInited()
    }
  })
  useEffect(() => {
    if (created) onCreateModalClose()
  }, [created]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (deleted) onDeleteModalClose()
  }, [deleted]) // eslint-disable-line react-hooks/exhaustive-deps
  // Render
  return (
    <>
      <Heading size="lg">Devices</Heading>
      {!inited || fetching ? (
        <Skeleton height="5em" borderRadius="0.25em" />
      ) : (
        <DeviceTable
          devices={devices}
          onDeviceCreate={onCreateModalOpen}
          onDeviceDelete={onDeviceDelete}
        />
      )}
      <CreateDeviceModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        onSubmit={onDeviceCreateConfirm}
        pending={creating}
      />
      <DeleteDeviceModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        device={targetDevice as Device}
        onSubmit={onDeviceDeleteConfirm}
        pending={deleting}
      />
    </>
  )
}

export default memo(DeviceTableContainer)
