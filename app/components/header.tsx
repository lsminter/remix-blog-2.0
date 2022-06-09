import { Link, useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "remix";
import { json } from "remix";
import groq from "groq";
import client from '../lib/sanity'

export const loader: LoaderFunction = async () => {
  const authorData = groq`*[_type == "author" && name == "Lucas Minter"][0]{
    name,
    image,
    bio
  }`
  const author = await client.fetch(authorData)
  return json({author})
}

export default function Header() {
  const author = {name: 'Lucas Minter'}
  console.log(author)
  return (
    <div className="flex text-2xl m-2 flex-row justify-between">
      <div>
        <Link to="/">Home</Link>
        <Link className="m-2" to="/posts">
          My Posts
        </Link>
      </div>
      <div className="">
        {author.name}
      </div>
    </div>
  )
}