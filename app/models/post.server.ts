import groq from 'groq'
import client from '../lib/sanity'

type Post = {
  title: string;
  body: string;
  slug: object;
  _createdAt: Date;
};

type Author = {
  name: string;
  bio: string;
  image: object;
}

const postsQuery = groq`*[_type == "post"] | order(_createdAt asc,) {
  title,
  category->,
  slug
}`

const authorQuery = groq`*[_type == "author" && name == "Lucas Minter"]{
  name,
  image,
  bio
}`

export async function getAuthor(): Promise<Array<Author>> {
  return await client.fetch(authorQuery);
}

export async function getPosts(): Promise<Array<Post>> {
  return await client.fetch(postsQuery);
}