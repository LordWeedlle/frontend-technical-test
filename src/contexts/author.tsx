import React, { createContext, useContext, useRef } from 'react'
import { getUserById, GetUserByIdResponse } from '../api'

type AuthorCacheContextType = {
  getAuthor: (id: string, token: string) => Promise<GetUserByIdResponse>
}

const AuthorCacheContext = createContext<AuthorCacheContextType | undefined>(undefined)

export const AuthorCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cacheRef = useRef(new Map<string, Promise<GetUserByIdResponse>>())

  const getAuthor = async (id: string, token: string) => {
    if (cacheRef.current.has(id)) {
      return cacheRef.current.get(id)!
    }

    const fetchPromise = getUserById(token, id).then((author) => {
      cacheRef.current.set(id, Promise.resolve(author))
      return author
    })

    cacheRef.current.set(id, fetchPromise)

    return fetchPromise
  }

  return (
    <AuthorCacheContext.Provider value={ { getAuthor } }>
      { children }
    </AuthorCacheContext.Provider>
  )
}

export const useAuthorCache = () => {
  const context = useContext(AuthorCacheContext)

  if (!context) {
    throw new Error('useAuthorCache must be used within AuthorCacheProvider')
  }

  return context
}
