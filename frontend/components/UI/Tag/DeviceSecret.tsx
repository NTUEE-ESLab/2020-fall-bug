import React from 'react'
import { HStack, Tag, Text, TagProps } from '@chakra-ui/react'
import KeyIcon from '~/components/Icon/Key'

const DeviceSecretTag = ({
  secret,
  ...props
}: TagProps & { secret?: string }) =>
  secret ? (
    <Tag
      {...props}
      fontFamily="Courier New"
      fontWeight="bold"
      flexShrink={0}
      colorScheme="red"
    >
      <HStack>
        <KeyIcon />
        <Text>{secret}</Text>
      </HStack>
    </Tag>
  ) : null

export default DeviceSecretTag
