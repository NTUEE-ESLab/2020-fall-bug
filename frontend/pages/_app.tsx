import React from 'react'
import { AppProps } from 'next/app'
import { Provider as ReduxProvider } from 'react-redux'
import { ChakraProvider } from '@chakra-ui/react'
// Theme
import { createStore } from '~/store'
import theme from '~/theme'

const App = ({ Component, pageProps }: AppProps) => (
  <ReduxProvider store={createStore()}>
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  </ReduxProvider>
)

export default App
