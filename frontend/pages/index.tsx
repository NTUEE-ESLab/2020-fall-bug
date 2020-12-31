import '~/util/day'
import dynamic from 'next/dynamic'
import React from 'react'
import { Box } from '@chakra-ui/react'
// Component
const Layout = dynamic(() => import('~/components/Layout'))
const EventWall = dynamic(() => import('~/components/Event/EventWall'))

const Home = () => (
  <Layout>
    <Box mt="5" />
    <EventWall />
  </Layout>
)

export default Home
