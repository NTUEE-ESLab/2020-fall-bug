import '~/util/day'
import dynamic from 'next/dynamic'
import React from 'react'
import { VStack } from '@chakra-ui/react'
// Dynamic
const Layout = dynamic(() => import('~/components/Layout'))
const EventCalendar = dynamic(() => import('~/containers/Event/EventCalendar'))
const EventAccordionInDay = dynamic(
  () => import('~/containers/Event/EventAccordionInDay'),
)
const DeviceTable = dynamic(() => import('~/containers/Device/DeviceTable'))

const HomePage = () => (
  <Layout>
    <VStack alignItems="stretch" my="5" spacing="5">
      <EventCalendar />
      <EventAccordionInDay />
      <DeviceTable />
    </VStack>
  </Layout>
)

export default HomePage
