import '~/util/day'
import dynamic from 'next/dynamic'
import React from 'react'
import { VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
// Dynamic
const Layout = dynamic(() => import('~/components/Layout'))
const DeviceContainer = dynamic(() => import('~/containers/Device/Device'))

const DevicePage = () => {
  const router = useRouter()
  // Render
  return (
    <Layout>
      <VStack alignItems="stretch" my="5" spacing="5">
        <DeviceContainer id={router.query.id as string} />
      </VStack>
    </Layout>
  )
}

export default DevicePage
