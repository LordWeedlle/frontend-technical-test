import React from 'react'
import { Skeleton } from '@chakra-ui/react'
import { GetUserByIdResponse, } from '../../api'

export type AuthorNameProps = {
  author: GetUserByIdResponse | null,
}

export const AuthorName: React.FC<AuthorNameProps> = ({ author }) => (
  author
    ? author.username
    : <Skeleton mt="1" ml="2" height="15px" width="150px" />
)
