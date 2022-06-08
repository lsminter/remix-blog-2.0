import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node"
import { getPosts } from "~/models/post.server";

type Post = {
  title: string;
  body: string;
  slug: object;
  _createdAt: Date;
};

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader: LoaderFunction = async () => {
  const res = await getPosts()

  return json<LoaderData>({
    posts: res
  });
};

export default function Posts () {
  const {posts} = useLoaderData<LoaderData>();
  return(
    <main className="m-2">
      <h1 className="text-3xl">Posts</h1>
      <div className="flex-row">
        <ul>
          {posts.map((post) => (
            <li className="text-blue-800" key={post.slug.current}>
              <Link
                to={post.slug.current}
              > 
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
        <h1>I'm currently working on writing some more posts but here are a couple of mock posts and an actual post for writing a blog using Remix and Sanity as a cms. </h1>
      </div>
    </main>
  )
}