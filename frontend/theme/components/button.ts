import { StyleConfig } from '@chakra-ui/theme-tools'

const resetBaseStyle = {
  outline: 'none',
  borderRadius: 0,
  _focus: {
    boxShadow: 'none',
  },
}

const button: { [key: string]: StyleConfig } = {
  Button: {
    baseStyle: { ...resetBaseStyle },
    variants: {
      reset: {
        minWidth: 0,
        padding: 0,
        _hover: {},
      },
    },
  },
}

export default button
