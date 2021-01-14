import React from 'react'
import { Tag, TagProps } from '@chakra-ui/react'
// Component
import Link from '~/components/UI/Link'
// Constant
import { ROUTES } from '~/constants'
// Type
import { Device } from '~/store/type'

const DeviceTag = ({
  device,
  variant = 'uuid',
  ...props
}: TagProps & {
  device: Device
  variant?: 'uuid' | 'name' | 'symbol'
}) => (
  <Link page={ROUTES.DEVICE} params={{ id: device.id }}>
    <Tag
      {...props}
      fontFamily="Courier New"
      fontWeight="bold"
      flexShrink={0}
      colorScheme="telegram"
    >
      {
        {
          uuid: device.id,
          name: device.name,
          symbol: `dev:${device.name}:${device.id.substr(0, 4)}`,
        }[variant]
      }
    </Tag>
  </Link>
)

export default DeviceTag
