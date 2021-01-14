import dayjs from 'dayjs'
import React, { useCallback, useState, memo } from 'react'
import { useDispatch } from 'react-redux'
import { Heading, Skeleton } from '@chakra-ui/react'
// Hook
import { useDidMount } from 'beautiful-react-hooks'
import { actions as eventActions, useEvents } from '~/store/event'
import useBool from '~/hook/useBool'
// Component
import EventCalendar from '~/components/Event/EventCalendar'

type EventCalendarProps = {
  heading?: string
}

const EventCalendarContainer = ({
  heading = 'Overview',
}: EventCalendarProps) => {
  const dispatch = useDispatch()
  // Global state
  const { events, pending: fetching } = useEvents()
  // Local state
  const [inited, setInited] = useBool()
  const [selectedYear] = useState(dayjs().year())
  // Event
  const updateFilterInDay = useCallback(
    (unixMilli: number) => {
      dispatch(eventActions.updateFilterInDay({ filterInDay: unixMilli }))
    },
    [dispatch],
  )
  // Effect
  useDidMount(() => {
    if (!inited) {
      if (!fetching) {
        dispatch(eventActions.fetch({}))
      }
      setInited()
    }
  })
  // Render
  return (
    <>
      <Heading size="lg">{heading}</Heading>
      {!inited || fetching ? (
        <Skeleton height="7em" borderRadius="0.25em" />
      ) : (
        <EventCalendar
          events={events}
          selectedYear={selectedYear}
          onDateClick={updateFilterInDay}
        />
      )}
    </>
  )
}

export default memo(EventCalendarContainer)
