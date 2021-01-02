import '~/util/day'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'
import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useDidMount } from 'beautiful-react-hooks'
import { VStack } from '@chakra-ui/react'
// Hook
import useBool from '~/hook/useBool'
import {
  actions as eventActions,
  useEvents,
  useEventsInDay,
} from '~/store/event'
import { actions as deviceActions, useDevices } from '~/store/device'
// Component
import { EventCalendarSkeleton } from '~/components/Event/EventCalendar'
// Dynamic
const Layout = dynamic(() => import('~/components/Layout'))
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
const DeviceList = dynamic(() => import('~/components/Device/DeviceList'))

const Home = () => {
  const dispatch = useDispatch()
  // Global state
  const { events, pending: eventFetching } = useEvents()
  const { events: eventsInDay, filterInDay } = useEventsInDay()
  const { devices, pending: deviceFetching } = useDevices()
  // Local state
  const [inited, setInited] = useBool()
  const [selectedYear] = useState(dayjs().year())
  // Event
  const updateFilterInDay = useCallback(
    (unixMilli) => {
      dispatch(eventActions.updateFilterInDay({ filterInDay: unixMilli }))
    },
    [dispatch],
  )
  // Effect
  useDidMount(() => {
    if (!inited) {
      dispatch(eventActions.fetch({}))
      dispatch(deviceActions.fetch({}))
      setInited()
    }
  })
  // Render
  return (
    <Layout>
      <VStack alignItems="stretch" my="5" spacing="5">
        <EventCalendar
          fetching={!inited || eventFetching}
          events={events}
          selectedYear={selectedYear}
          onDaySelected={updateFilterInDay}
        />
        <EventListInDay
          filterInDay={filterInDay}
          fetching={!inited || eventFetching}
          events={eventsInDay}
        />
        <DeviceList fetching={!inited || deviceFetching} devices={devices} />
      </VStack>
    </Layout>
  )
}

export default Home
