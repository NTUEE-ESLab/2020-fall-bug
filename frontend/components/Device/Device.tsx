import React from 'react'
import { Heading, Text, SimpleGrid } from '@chakra-ui/react'
// Component
import DeviceTag from '~/components/UI/Tag/Device'
// Type
import * as type from '~/store/type'

type DeviceProps = {
  device: type.Device
}

const Device = ({ device }: DeviceProps) => (
  <SimpleGrid
    px="3"
    templateColumns="max-content 1fr"
    spacingX={5}
    spacingY={3}
    alignItems="center"
  >
    <Heading size="sm">ID</Heading>
    <Text>
      <DeviceTag device={device} />
    </Text>
    <Heading size="sm">NAME</Heading>
    <Text>{device.name}</Text>
    <Heading size="sm">DESCRIPTION</Heading>
    <Text>{device.description}</Text>
  </SimpleGrid>
)

export default Device
