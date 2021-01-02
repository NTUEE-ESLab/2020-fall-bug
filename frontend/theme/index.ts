import { extendTheme } from '@chakra-ui/react'
import components from '~/theme/components'
import styles from '~/theme/styles'
import colors from '~/theme/colors'

const override = {
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
  components,
  styles,
  colors,
  shadows: {
    outline: 'none',
  },
}

export default extendTheme(override)
