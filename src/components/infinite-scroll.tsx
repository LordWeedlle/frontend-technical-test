import React, { ReactNode, useEffect, useRef } from 'react'
import { Box } from '@chakra-ui/react'
import { Loader } from '../components/loader'

export type InfiniteScrollProps = {
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void,
  children: ReactNode,
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({ hasNextPage, isFetchingNextPage, fetchNextPage, children }) => {
  const loaderRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 1.0 },
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return <>
    { children }
    { isFetchingNextPage && <Loader /> }
    <Box ref={loaderRef} height="20px" />
  </>
}
