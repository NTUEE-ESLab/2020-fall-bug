import dynamic from 'next/dynamic'
import React from 'react'
import { Box, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
// Config
import config from '~/config'
// Type
import { Event } from '~/store/type'

const WavPlayer = dynamic(() => import('~/components/Visual/WavPlayer'), {
  ssr: false,
})

type EventItemProps = {
  event: Event
  isExpanded?: boolean
}

const EventItem = ({ event, isExpanded = false }: EventItemProps) => {
  switch (event.kind) {
    case 'sound':
      return (
        <Box>
          <WavPlayer
            url={`${config.backend.endpoint}/static/wav/${event.payload.wavFile}`}
            shouldReRender={isExpanded}
          />
        </Box>
      )
    case 'position':
      return (
        <Box>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th />
                <Th isNumeric>FROM</Th>
                <Th isNumeric>TO</Th>
              </Tr>
            </Thead>
            <Tbody>
              {['X', 'Y', 'Z'].map((axis, idx) => (
                <Tr
                  key={axis}
                  transition="0.1s all ease"
                  _hover={{ bgColor: 'gray.200' }}
                >
                  <Td>{axis}</Td>
                  <Td isNumeric>{event.payload.from[idx]}</Td>
                  <Td isNumeric>{event.payload.to[idx]}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )
    default:
      return <Box>{JSON.stringify(event, null, 2)}</Box>
  }
}

export default EventItem
