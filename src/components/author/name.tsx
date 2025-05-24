import React from 'react'
import { Skeleton, Text, TextProps } from '@chakra-ui/react'
import { GetUserByIdResponse, } from '../../api'

export type AuthorNameProps = {
  author: GetUserByIdResponse | null,
} & TextProps

export const AuthorName: React.FC<AuthorNameProps> = ({ author, ...props }) => (
  author
    ? <Text { ...props }>
      { author.username }
    </Text>
    : <Skeleton mt="1" ml="2" height="15px" width="150px" />
)
