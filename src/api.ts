import { MemePictureProps } from './components/meme-picture'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
  }
}

export class NotFoundError extends Error {
  constructor() {
    super('Not Found');
  }
}

function checkStatus(response: Response) {
  if (response.status === 401) {
    localStorage.removeItem('jwt');
    window.location.href = '/login';

    throw new UnauthorizedError();
  }
  if (response.status === 404) {
    throw new NotFoundError();
  }
  return response;
}

export type LoginResponse = {
  jwt: string
}

/**
 * Authenticate the user with the given credentials
 * @param username 
 * @param password 
 * @returns 
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  return await fetch(`${BASE_URL}/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password }),
  }).then(res => checkStatus(res).json())
}

export type GetUserByIdResponse = {
  id: string;
  username: string;
  pictureUrl: string;
}

/**
 * Get a user by their id
 * @param token 
 * @param id 
 * @returns 
 */
export async function getUserById(token: string, id: string): Promise<GetUserByIdResponse> {
  return await fetch(`${BASE_URL}/users/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json())
}

export type GetMemesResponse = {
  total: number;
  pageSize: number;
  results: MemeResponse[];
}

export type MemeResponse = {
  id: string;
  authorId: string;
  pictureUrl: string;
  description: string;
  commentsCount: string;
  texts: {
    content: string;
    x: number;
    y: number;
  }[];
  createdAt: string;
}

/**
 * Get the list of memes for a given page
 * @param token 
 * @param page 
 * @returns 
 */
export async function getMemes(token: string, page: number): Promise<GetMemesResponse> {
  return await fetch(`${BASE_URL}/memes?page=${page}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json())
}

export type GetMemeCommentsResponse = {
  total: number;
  pageSize: number;
  results: CreateCommentResponse[];
}

/**
 * Get comments for a meme
 * @param token
 * @param memeId
 * @param page
 * @returns
 */
export async function getMemeComments(token: string, memeId: string, page: number): Promise<GetMemeCommentsResponse> {
  return await fetch(`${BASE_URL}/memes/${memeId}/comments?page=${page}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json())
}

export type CreateCommentResponse = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  memeId: string;
}

/**
 * Create a comment for a meme
 * @param token
 * @param memeId
 * @param content
 */
export async function createMemeComment(token: string, memeId: string, content: string): Promise<CreateCommentResponse> {
  return await fetch(`${BASE_URL}/memes/${memeId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content }),
  }).then(res => checkStatus(res).json());
}

export type Picture = {
  url: string;
  file: File;
};

/**
 * Create a meme
 * @param token
 * @param picture
 * @param description
 * @param texts
 */
export async function createMeme(token: string, picture: Picture, description: string, texts: MemePictureProps["texts"]): Promise<MemeResponse> {
  const formData = new FormData();
  formData.append("picture", picture.file);
  formData.append("description", description);

  texts.forEach((text, index) => {
    formData.append(`texts[${index}][content]`, text.content);
    formData.append(`texts[${index}][x]`, Math.round(text.x).toString());
    formData.append(`texts[${index}][y]`, Math.round(text.y).toString());
  });

  return await fetch(`${ BASE_URL }/memes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ token }`
    },
    body: formData,
  }).then(res => checkStatus(res).json());
}