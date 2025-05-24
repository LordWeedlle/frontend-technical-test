import React, { useEffect, useState } from 'react'
import {
  Box,
  Collapse,
  Flex,
  Icon,
  Input,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from '@chakra-ui/react'
import { CaretDown, CaretUp, Chat } from '@phosphor-icons/react'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { format } from 'timeago.js'
import { createMemeComment, getMemeComments, GetUserByIdResponse, MemeResponse } from '../api'
import { AuthorAvatar } from '../components/author/avatar'
import { AuthorName } from '../components/author/name'
import { CommentCard } from '../components/comment-card'
import { InfiniteScroll } from '../components/infinite-scroll'
import { Loader } from '../components/loader'
import { MemePicture } from '../components/meme-picture.tsx'
import { useAuthToken } from '../contexts/authentication'
import { useAuthorCache } from '../contexts/author'

export type MemeCardProps = {
  meme: MemeResponse,
  user: GetUserByIdResponse,
}

export const MemeCard: React.FC<MemeCardProps> = ({ meme, user }) => {
  const token               = useAuthToken()
  const { getAuthor }       = useAuthorCache()
  const [author, setAuthor] = useState<GetUserByIdResponse | null>(null)

  useEffect(() => {
    let mounted = true

    getAuthor(meme.authorId, token).then((data) => {
      if (mounted) {
        setAuthor(data)
      }
    })

    return () => {
      mounted = false
    }
  }, [meme.authorId, token, getAuthor])

  const [openedCommentSection, setOpenedCommentSection] = useState<boolean>(false)
  const [commentContent, setCommentContent]             = useState<{
    [key: string]: string;
  }>({})
  const { mutate }                                      = useMutation({
    mutationFn: async (data: { memeId: string; content: string }) => {
      await createMemeComment(token, data.memeId, data.content)
    },
  })

  const {
          data,
          fetchNextPage,
          hasNextPage,
          isFetchingNextPage,
          status,
        } = useInfiniteQuery({
    queryKey: ['comments', meme.id],
    enabled: openedCommentSection,
    queryFn: async ({ pageParam }) => getMemeComments(token, meme.id, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize)

      return pages.length < totalPages ? pages.length + 1 : undefined
    },
  })

  return (
    <VStack key={ meme.id } p={ 4 } width="full" align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex>
          <AuthorAvatar author={ author } />
          <Text ml={ 2 } data-testid={ `meme-author-${ meme.id }` }>
            <AuthorName author={ author } />
          </Text>
        </Flex>
        <Text fontStyle="italic" color="gray.500" fontSize="small">
          { format(meme.createdAt) }
        </Text>
      </Flex>
      <MemePicture pictureUrl={ meme.pictureUrl } texts={ meme.texts } dataTestId={ `meme-picture-${ meme.id }` } />
      <Box>
        <Text fontWeight="bold" fontSize="medium" mb={ 2 }>
          Description:{ ' ' }
        </Text>
        <Box
          p={ 2 }
          borderRadius={ 8 }
          border="1px solid"
          borderColor="gray.100"
        >
          <Text color="gray.500" whiteSpace="pre-line" data-testid={ `meme-description-${ meme.id }` }>
            { meme.description }
          </Text>
        </Box>
      </Box>
      <LinkBox as={ Box } py={ 2 } borderBottom="1px solid black">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <LinkOverlay
              data-testid={ `meme-comments-section-${ meme.id }` }
              cursor="pointer"
              onClick={ () =>
                setOpenedCommentSection(!openedCommentSection)
              }
            >
              <Text data-testid={ `meme-comments-count-${ meme.id }` }>{ meme.commentsCount } comments</Text>
            </LinkOverlay>
            <Icon
              as={ openedCommentSection ? CaretDown : CaretUp }
              ml={ 2 }
              mt={ 1 }
            />
          </Flex>
          <Icon as={ Chat } />
        </Flex>
      </LinkBox>
      <Collapse in={ openedCommentSection } animateOpacity>
        <Box mb={ 6 }>
          <form
            onSubmit={ (event) => {
              event.preventDefault()
              if (commentContent[meme.id]) {
                mutate({
                  memeId: meme.id,
                  content: commentContent[meme.id],
                })
              }
            } }
          >
            <Flex alignItems="center">
              <AuthorAvatar author={ user } />
              <Input
                placeholder="Type your comment here..."
                onChange={ (event) => {
                  setCommentContent({
                    ...commentContent,
                    [meme.id]: event.target.value,
                  })
                } }
                value={ commentContent[meme.id] }
              />
            </Flex>
          </form>
        </Box>
        <VStack align="stretch" spacing={ 4 }>
          {
            status === 'pending'
              ? <Loader />
              : (
                <InfiniteScroll
                  hasNextPage={ hasNextPage }
                  isFetchingNextPage={ isFetchingNextPage }
                  fetchNextPage={ fetchNextPage }
                >
                  {
                    data?.pages.flatMap(page =>
                      page.results.map(comment => (
                        <CommentCard key={ comment.id } comment={ comment } memeId={ meme.id } />
                      )),
                    )
                  }
                </InfiniteScroll>
              )
          }
        </VStack>
      </Collapse>
    </VStack>
  )
}
