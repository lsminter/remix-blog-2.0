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
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug.current}>
            <Link
              to={post.slug.current}
            > 
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}