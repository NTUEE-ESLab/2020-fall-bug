import React from 'react'
import { Tag, TagProps } from '@chakra-ui/react'

const DeviceIdTag = ({
  id,
  short = false,
  showPrefix = false,
  prefix = 'dev:',
  ...props
}: TagProps & {
  id: string
  short?: boolean
  showPrefix?: boolean
  prefix?: string
}) => (
  <Tag
    {...props}
    fontFamily="Courier New"
    fontWeight="bold"
    flexShrink={0}
    colorScheme="telegram"
  >
    {showPrefix ? prefix : null}
    {short ? id.substr(0, 8) : id}
  </Tag>
)

export default DeviceIdTag
