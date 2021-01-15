import styled from '@emotion/styled'
import { Box, Tr } from '@chakra-ui/react'

const HoverableBox = styled(Box)``

const HoverableTr = styled(Tr)`
  ${HoverableBox} {
    opacity: 0;
    transition: 0.1s opacity ease-in-out;
  }
  &:hover {
    ${HoverableBox} {
      opacity: 1;
    }
  }
`

export default {
  Box: HoverableBox,
  Tr: HoverableTr,
}
