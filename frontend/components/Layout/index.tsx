import React, { FC } from 'react'
import { StylesProvider, useMultiStyleConfig } from '@chakra-ui/react'
// Component
import Header from '~/components/Layout/Header'
import Main from '~/components/Layout/Main'
import Footer from '~/components/Layout/Footer'

const Layout: FC = ({ children }) => (
  <StylesProvider value={useMultiStyleConfig('Layout', {})}>
    <Header />
    <Main>{children}</Main>
    <Footer />
  </StylesProvider>
)

export default Layout
