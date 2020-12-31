import dayjs from 'dayjs'
import dynamic from 'next/dynamic'
import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useDidMount } from 'beautiful-react-hooks'
import { VStack, Heading } from '@chakra-ui/react'
// Hook
import useBool from '~/hook/useBool'
import { actions, useEvents, useEventsInDay } from '~/store/event'
// Component
import { EventCalendarSkeleton } from '~/components/Event/EventCalendar'

const EventCalendar = dynamic(
  () => import('~/components/Event/EventCalendar'),
  {
    ssr: false,
    loading: EventCalendarSkeleton,
  },
)
const EventListInDay = dynamic(
  () => import('~/components/Event/EventListInDay'),
)

const EventWall = () => {
  const dispatch = useDispatch()
  // Global state
  const { events, fetching } = useEvents()
  const { events: eventsInDay, filterInDay } = useEventsInDay()
  // Local state
  const [inited, setInited] = useBool()
  const [selectedYear] = useState(dayjs().year())
  // Event
  const setSelectedUnixMilli = useCallback(
    (unixMilli) => {
      dispatch(actions.updateFilterInDay({ filterInDay: unixMilli }))
    },
    [dispatch],
  )
  // Effect
  useDidMount(() => {
    if (!inited) {
      dispatch(actions.fetch())
      setInited()
    }
  })
  // Render
  return (
    <VStack alignItems="stretch" spacing="5">
      <Heading size="lg">Overview</Heading>
      <EventCalendar
        fetching={!inited || fetching}
        events={events}
        selectedYear={selectedYear}
        setSelectedUnixMilli={setSelectedUnixMilli}
      />
      <Heading size="lg">
        Events - {dayjs(filterInDay).format('YYYY/MM/DD')}
      </Heading>
      <EventListInDay fetching={!inited || fetching} events={eventsInDay} />
    </VStack>
  )
}

export default EventWall
