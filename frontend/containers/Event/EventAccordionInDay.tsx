import dayjs from 'dayjs'
import React, { useCallback, useEffect, useState } from 'react'
import { Heading, Skeleton, useDisclosure } from '@chakra-ui/react'
// Hook
import { useDidMount } from 'beautiful-react-hooks'
import { useDispatch } from 'react-redux'
import { actions as eventActions, useEventsInDay } from '~/store/event'
import { actions as deviceActions, useDeviceEntities } from '~/store/device'
import { actions as labelActions, useCreateLabelStatus } from '~/store/label'
import useBool from '~/hook/useBool'
// Component
import EventAccordion from '~/components/Event/EventAccordion'
import CreateLabelModal from '~/components/Label/Modal/CreateLabel'
// Type
import { Event } from '~/store/type'

const EventListInDay = () => {
  // Global state
  const dispatch = useDispatch()
  const { events, filterInDay, pending: eventFetching } = useEventsInDay()
  const { pending: deviceFetching } = useDeviceEntities()
  const { pending: creating, resolved: created } = useCreateLabelStatus()
  // Local state
  const [inited, setInited] = useBool()
  const fetching = !inited || eventFetching || deviceFetching
  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure()
  const [targetEvent, setTargetEvent] = useState<Event>()
  // Event
  const onLabelCreateConfirm = useCallback(
    (newLabel: Parameters<typeof labelActions.create>[0]) => {
      dispatch(labelActions.create(newLabel))
    },
    [dispatch],
  )
  const onLabelCreate = useCallback(
    (event: Event) => {
      onCreateModalOpen()
      setTargetEvent(event)
    },
    [onCreateModalOpen, setTargetEvent],
  )
  // Effect
  useDidMount(() => {
    if (!inited) {
      if (!eventFetching) {
        dispatch(eventActions.fetch({}))
      }
      if (!deviceFetching) {
        dispatch(deviceActions.fetch({}))
      }
      setInited()
    }
  })
  useEffect(() => {
    if (created) onCreateModalClose()
  }, [created]) // eslint-disable-line react-hooks/exhaustive-deps
  // Render
  return (
    <>
      <Heading size="lg">
        Events - {dayjs(filterInDay).format('YYYY/MM/DD')}
      </Heading>
      {!inited || fetching ? (
        <>
          <Skeleton height="2.5em" borderRadius="0.25em" />
          <Skeleton height="2.5em" borderRadius="0.25em" />
          <Skeleton height="2.5em" borderRadius="0.25em" />
        </>
      ) : (
        <EventAccordion
          events={Array<Event>(0)
            .concat(...events)
            .reverse()}
          onLabelCreate={onLabelCreate}
        />
      )}
      <CreateLabelModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        event={targetEvent as Event}
        onSubmit={onLabelCreateConfirm}
        pending={creating}
      />
    </>
  )
}

export default EventListInDay
