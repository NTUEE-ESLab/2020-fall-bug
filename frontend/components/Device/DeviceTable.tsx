import React from 'react'
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  Spacer,
} from '@chakra-ui/react'
// Component
import BinIcon from '~/components/Icon/Bin'
import Hoverable from '~/components/UI/Table/Hoverable'
import DeviceTag from '~/components/UI/Tag/Device'
import DeviceSecretTag from '~/components/UI/Tag/DeviceSecret'
// Type
import { Device } from '~/store/type'

type DeviceTableProps = {
  devices: Device[]
  onDeviceDelete: (device: Device) => void
  onDeviceCreate: () => void
}

const DeviceTable = ({
  devices,
  onDeviceDelete,
  onDeviceCreate,
}: DeviceTableProps) => (
  <Box p="3" borderRadius="0.5em" bgColor="gray.100">
    <Table size="sm">
      <Thead>
        <Tr>
          <Th>ID</Th>
          <Th>NAME</Th>
          <Th>DESCRIPTION</Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {devices.map((device) => (
          <Hoverable.Tr
            key={device.id}
            transition="0.1s all ease"
            _hover={{ bgColor: 'gray.200' }}
          >
            <Td>
              <VStack alignItems="flex-start">
                <DeviceTag device={device} />
                <DeviceSecretTag secret={device.secret} />
              </VStack>
            </Td>
            <Td>{device.name}</Td>
            <Td>{device.description}</Td>
            <Td isNumeric>
              <HStack>
                <Spacer />
                <Hoverable.Box>
                  <BinIcon
                    cursor="pointer"
                    onClick={() => onDeviceDelete(device)}
                  />
                </Hoverable.Box>
              </HStack>
            </Td>
          </Hoverable.Tr>
        ))}
        <Tr transition="0.1s all ease" _hover={{ bgColor: 'gray.200' }}>
          <Td colSpan={5} p="0">
            <Button
              onClick={onDeviceCreate}
              size="s"
              w="100%"
              h="100%"
              p="0.5em"
              borderRadius="0"
            >
              New
            </Button>
          </Td>
        </Tr>
      </Tbody>
    </Table>
  </Box>
)

export default DeviceTable
