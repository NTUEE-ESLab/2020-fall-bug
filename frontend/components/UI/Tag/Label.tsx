import React from 'react'
import { Tag, TagProps } from '@chakra-ui/react'
// Type
import { Label } from '~/store/type'

type LabelTagProps = TagProps & {
  label: Label
  variant?: 'uuid' | 'name' | 'symbol'
}

const LabelTag = ({ label, variant = 'uuid', ...props }: LabelTagProps) => (
  <Tag
    {...props}
    fontFamily="Courier New"
    fontWeight="bold"
    flexShrink={0}
    colorScheme="facebook"
  >
    {
      {
        uuid: label.id,
        name: label.name,
        symbol: `lbl:${label.name}`,
      }[variant]
    }
  </Tag>
)

export default LabelTag
