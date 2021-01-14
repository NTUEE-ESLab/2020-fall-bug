import React, {
  useCallback,
  useEffect,
  useState,
  ReactNode,
  ReactElement,
  AnchorHTMLAttributes,
} from 'react'
import NextLink from 'next/link'
import { Box } from '@chakra-ui/react'
// Util
import { createTemplateExecutor } from '~/util/template'

type LinkProps = {
  children: ReactNode
  page: string
  params?: Record<string, string>
  escapeCurrent?: boolean
  anchorProps?: AnchorHTMLAttributes<any>
}

const Link = ({
  children,
  page,
  params = {},
  escapeCurrent = false,
  anchorProps = {},
}: LinkProps) => {
  // Local state
  const [isCurrentPage, setIsCurrentPage] = useState(false)
  const getAs = useCallback(
    (routeParams) => {
      const { execute } = createTemplateExecutor(page, {
        charWrapper: 'square_brackets',
      })
      return execute(routeParams)
    },
    [page],
  )
  const as = getAs(params)
  // Effect
  useEffect(() => {
    if (window.location.pathname === as) setIsCurrentPage(true)
    return () => {}
  }, [as])
  // Render
  return isCurrentPage || escapeCurrent ? (
    (children as ReactElement<any>)
  ) : (
    <NextLink href={page} as={params ? as : undefined}>
      <Box
        as="a"
        cursor="pointer"
        _hover={{
          textDecor: 'underline',
        }}
        {...anchorProps}
      >
        {children}
      </Box>
    </NextLink>
  )
}

export default Link
