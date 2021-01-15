import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useDidMount } from 'beautiful-react-hooks'
import { useDisclosure, Heading, Skeleton } from '@chakra-ui/react'
// Hook
import useBool from '~/hook/useBool'
import { actions as deviceActions, useDevice } from '~/store/device'
import {
  actions as labelAction,
  useLabels,
  useDeleteLabelStatus,
} from '~/store/label'
// Component
import Device from '~/components/Device/Device'
import LabelTable from '~/components/Label/LabelTable'
import DeleteLabelModal from '~/components/Label/Modal/DeleteLabel'
// Type
import { Label } from '~/store/type'

type DeviceProps = {
  id: string
}

const DeviceContainer = ({ id }: DeviceProps) => {
  // Global state
  const dispatch = useDispatch()
  const { device, pending: deviceFetching } = useDevice(id)
  const { pending: labelFetching } = useLabels()
  const fetching = deviceFetching || labelFetching
  const {
    pending: labelDeleting,
    resolved: labelDeleted,
  } = useDeleteLabelStatus()
  // Local state
  const [inited, setInited] = useBool()
  const {
    isOpen: isDeleteLabelModalOpen,
    onOpen: onDeleteLabelModalOpen,
    onClose: onDeleteLabelModalClose,
  } = useDisclosure()
  const [targetLabel, setTargetLabel] = useState<Label>()
  // Event
  const onLabelDelete = useCallback(
    (label: Label) => {
      onDeleteLabelModalOpen()
      setTargetLabel(label)
    },
    [onDeleteLabelModalOpen, setTargetLabel],
  )
  const onLabelDeleteConfirm = useCallback(() => {
    dispatch(labelAction.delete(targetLabel as Label))
  }, [dispatch, targetLabel])
  // Effect
  useDidMount(() => {
    if (!inited) {
      if (!deviceFetching) {
        dispatch(deviceActions.fetch({}))
      }
      if (!labelFetching) {
        dispatch(labelAction.fetch({}))
      }
      setInited()
    }
  })
  useEffect(() => {
    if (labelDeleted) onDeleteLabelModalClose()
  }, [labelDeleted]) // eslint-disable-line react-hooks/exhaustive-deps
  // Render
  return (
    <>
      <Heading size="lg">Device</Heading>
      {!inited || !id || fetching ? (
        <Skeleton height="5em" borderRadius="0.25em" />
      ) : (
        <Device device={device} />
      )}
      <Heading size="lg">Device Label Specification</Heading>
      {!inited || !id || fetching ? (
        <Skeleton height="5em" borderRadius="0.25em" />
      ) : (
        <>
          <LabelTable labels={device.labels} onLabelDelete={onLabelDelete} />
          <DeleteLabelModal
            isOpen={isDeleteLabelModalOpen}
            onClose={onDeleteLabelModalClose}
            label={targetLabel as Label}
            onSubmit={onLabelDeleteConfirm}
            pending={labelDeleting}
          />
        </>
      )}
    </>
  )
}

export default DeviceContainer
