import {marked} from 'marked'
import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import client from '../../lib/sanity'
import groq from 'groq'

export const loader: LoaderFunction = async ({params}) => {
  const {slug} = params
  const postData = groq`*[_type == "post" && slug.current == "${slug}"] [0]{
    title,
    author->,
    body,
    publishedAt,
    slug
  }`
  const post = await client.fetch(postData)
  return json({post})
}

export default function PostRoute() {
  const {post} = useLoaderData()
  const html = marked(post.body)
  return (
    <main className="mx-auto max-w-4x1">
      <h1 className="my-6 border-b-2 text-center text-3xl">{post.title}</h1>
      <div className="prose m-5 max-w-none">
        <h4 className='text-center'>Published on {post.publishedAt} by {post.author.name}</h4>
        <div dangerouslySetInnerHTML={{__html: html}}/>
      </div>
    </main>
  )
}