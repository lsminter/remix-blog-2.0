import groq from 'groq'
import client from '../lib/sanity'

type Post = {
  title: string;
  body: string;
  slug: object;
  _createdAt: Date;
};

const postsQuery = groq`*[_type == "post"] | order(_createdAt asc,) {
  title,
  author,
  category,
  body,
  publishedAt,
  slug
}`

export async function getPosts(): Promise<Array<Post>> {
  return await client.fetch(postsQuery);
}