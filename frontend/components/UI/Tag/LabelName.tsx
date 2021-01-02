import React from 'react'
import { Tag, TagProps } from '@chakra-ui/react'

const LabelNameTag = ({
  name,
  showPrefix = false,
  prefix = 'lbl:',
  ...props
}: TagProps & {
  name: string
  showPrefix?: boolean
  prefix?: string
}) => (
  <Tag
    {...props}
    fontFamily="Courier New"
    fontWeight="bold"
    flexShrink={0}
    colorScheme="facebook"
  >
    {showPrefix ? prefix : null}
    {name}
  </Tag>
)

export default LabelNameTag
