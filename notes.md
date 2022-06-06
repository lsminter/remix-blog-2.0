> npx create-remix --template remix-run/indie-stack remix-blog-2.0
created here = ./remix-blog-2.0
deployment = Netlify
Typscript
yes run npm install

create github repo 

add route to `/posts` using `Link` from @remix-run/react

Create posts page to hold all of the posts

> npm install -g @sanity/cli && sanity init = create sanity project in blog
create new project
project name = cms-2.0
use default dataset config - yes
project path - do it in the root of your blog
select project template - blog

start cms server
create two mock posts on your cms so you have a dataset to work with. 

create sanity client to make calls to sanity
### app/lib/sanity.js
```
import sanityClient from '@sanity/client'

export default sanityClient({
  projectId: 'your-token', // you can find this in sanity.json
  dataset: 'production', // or the name you chose in step 1
  useCdn: false, // `false` if you want to ensure fresh data
  ignoreBrowserTokenWarning: true,
})
```

create `models/post.server.ts` to create functions to call sanity data
### models/post.server.ts
```ts
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
```

Load data from sanity onto Posts page
### posts/index.tsx
```tsx
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
```

