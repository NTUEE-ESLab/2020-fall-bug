import React, { createIcon } from '@chakra-ui/react'

const BinIcon = createIcon({
  displayName: 'BinIcon',
  viewBox: '0 0 512 512',
  path: [
    <path
      key="1"
      d="M64 160v320c0 17.6 14.4 32 32 32h288c17.6 0 32-14.4 32-32v-320h-352zM160 448h-32v-224h32v224zM224 448h-32v-224h32v224zM288 448h-32v-224h32v224zM352 448h-32v-224h32v224z"
    />,
    <path
      key="2"
      d="M424 64h-104v-40c0-13.2-10.8-24-24-24h-112c-13.2 0-24 10.8-24 24v40h-104c-13.2 0-24 10.8-24 24v40h416v-40c0-13.2-10.8-24-24-24zM288 64h-96v-31.599h96v31.599z"
    />,
  ],
})

export default BinIcon
