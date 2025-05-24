import React, { useEffect, useState } from 'react'
import { format } from 'timeago.js'
import { Box, Flex, Text } from '@chakra-ui/react'
import { CreateCommentResponse, GetUserByIdResponse } from '../api'
import { AuthorAvatar } from '../components/author/avatar'
import { AuthorName } from '../components/author/name'
import { useAuthToken } from '../contexts/authentication'
import { useAuthorCache } from '../contexts/author'

export type CommentCardProps = {
  comment: CreateCommentResponse
  memeId: string,
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, memeId }) => {
  const token               = useAuthToken()
  const { getAuthor }       = useAuthorCache()
  const [author, setAuthor] = useState<GetUserByIdResponse | null>(null)

  useEffect(() => {
    let mounted = true

    getAuthor(comment.authorId, token).then((data) => {
      if (mounted) {
        setAuthor(data)
      }
    })

    return () => {
      mounted = false
    }
  }, [comment.authorId, token, getAuthor])

  return (
    <Flex key={ comment.id }>
      <AuthorAvatar author={ author } />
      <Box p={ 2 } borderRadius={ 8 } bg="gray.50" flexGrow={ 1 }>
        <Flex
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex>
            <AuthorName author={ author } data-testid={ `meme-comment-author-${ memeId }-${ comment.id }` } />
          </Flex>
          <Text
            fontStyle="italic"
            color="gray.500"
            fontSize="small"
          >
            { format(comment.createdAt) }
          </Text>
        </Flex>
        <Text
          color="gray.500"
          whiteSpace="pre-line"
          data-testid={ `meme-comment-content-${ memeId }-${ comment.id }` }
        >
          { comment.content }
        </Text>
      </Box>
    </Flex>
  )
}
