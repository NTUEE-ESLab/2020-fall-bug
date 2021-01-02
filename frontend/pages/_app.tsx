import React, { useRef } from 'react'
import { AppProps } from 'next/app'
import { Provider as ReduxProvider } from 'react-redux'
import { ChakraProvider } from '@chakra-ui/react'
// Theme
import { createStore } from '~/store'
import theme from '~/theme'

const App = ({ Component, pageProps }: AppProps) => {
  const store = useRef(createStore())
  return (
    <ReduxProvider store={store.current}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ReduxProvider>
  )
}

export default App
