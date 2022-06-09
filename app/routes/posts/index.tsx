import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node"
import { getPosts } from "~/models/post.server";

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
  console.log(posts)
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
      </div>
    </main>
  )
}