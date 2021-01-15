import React from 'react'
import { Tag, Text, TagProps } from '@chakra-ui/react'
// Type
import { EventKind } from '~/store/type'

const EventKindTag = ({ kind, ...props }: TagProps & { kind: EventKind }) => (
  <Tag
    {...props}
    fontFamily="Courier New"
    fontWeight="bold"
    flexShrink={0}
    colorScheme="orange"
    bgColor="orange.200"
  >
    <Text>{kind}</Text>
  </Tag>
)

export default EventKindTag
