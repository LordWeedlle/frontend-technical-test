import React from 'react'
import { Avatar, SkeletonCircle } from '@chakra-ui/react'
import { GetUserByIdResponse, } from '../../api'

export type AuthorAvatarProps = {
  author: GetUserByIdResponse | null,
}

export const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ author }) => (
  author
    ? (
      <Avatar
        borderWidth="1px"
        borderColor="gray.300"
        size="xs"
        name={ author.username }
        src={ author.pictureUrl }
      />
    )
    : <SkeletonCircle height="22px" width="22px" />
)
