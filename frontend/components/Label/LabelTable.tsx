import React from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Spacer,
} from '@chakra-ui/react'
// Component
import BinIcon from '~/components/Icon/Bin'
import Hoverable from '~/components/UI/Table/Hoverable'
import LabelTag from '~/components/UI/Tag/Label'
import LabelRule from '~/components/Label/LabelRule'
import EventKindTag from '~/components/UI/Tag/EventKind'
// Type
import { Label } from '~/store/type'

type LabelTableProps = {
  labels: Label[]
  onLabelDelete: (label: Label) => void
}

const LabelTable = ({ labels, onLabelDelete }: LabelTableProps) => (
  <Box p="3" borderRadius="0.5em" bgColor="gray.100">
    <Table size="sm">
      <Thead>
        <Tr>
          <Th>NAME</Th>
          <Th>DESCRIPTION</Th>
          <Th>RULE TARGET</Th>
          <Th>RULE</Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {labels.map((label) => (
          <Hoverable.Tr
            key={label.id}
            transition="0.1s all ease"
            _hover={{ bgColor: 'gray.200' }}
          >
            <Td>
              <LabelTag variant="name" label={label} />
            </Td>
            <Td>{label.description}</Td>
            <Td>
              <EventKindTag kind={label.eventKind} />
            </Td>
            <Td>
              <LabelRule rule={label.rule} />
            </Td>
            <Td isNumeric>
              <HStack>
                <Spacer />
                <Hoverable.Box>
                  <BinIcon
                    cursor="pointer"
                    onClick={() => onLabelDelete(label)}
                  />
                </Hoverable.Box>
              </HStack>
            </Td>
          </Hoverable.Tr>
        ))}
      </Tbody>
    </Table>
  </Box>
)

export default LabelTable
