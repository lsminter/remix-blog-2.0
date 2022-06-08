I created a simple blog using Remix and Sanity.io as my content management system. It was pretty simple to do. 

I started with a remix blog template 👇
```bash
> npx create-remix --template remix-run/indie-stack remix-blog-2.0
```

Made sure the out was in the correct spot with the correct output `./remix-blog-2.0`. 

For the deployment method, I selected Netlify since I've used that in the past but I'm not going to go over deploying in this post.

I'm going to use Typescript instead of just plain Javascript for good practice. 

Lastly, select yes to run `npm install`. 


Next I went ahead and created my repository in github so I had a place to store and share my code. 

Back in our code, we need a place to access our posts. Add a route to `/posts` using `Link` from `@remix-run/react`

### app/routes/index.tsx
```tsx
import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <Link to="/posts">
            Posts
          </Link>
        </li>
      </ul>
    </div>
  );
}
```

Now we need to get to work on Sanity. You'll need to create an account if you haven't done so yet. In your terminal, run `npm install -g @sanity/cli && sanity init` to create sanity project in blog. 

Following along with the prompts, create your new project, I named mine `cms-2.0`. I used the default dataset config. For the project path, I have mine in the root of my Remix blog. Lastly, select `blog` as your project template and it will create a lot of the fields you'll need for your blog.

Now start your cms server by cd'ing into the Sanity project and running `yarn start`. Go ahead and create two mock posts that we will use to create our blog by just filling in the fields. We will be using these two posts as our testing data while creating the blog. 

To make fetch requests to Sanity, Sanity needs to know what project we are trying to make requests to. Create a file in your lib folder called `app/lib/sanity.js` and populate it with this code. You'll also need to install `yarn add @sanity/client`.

### app/lib/sanity.js
```js
import sanityClient from '@sanity/client'

export default sanityClient({
  projectId: 'your-token', // you can find this in sanity.json
  dataset: 'production', // or the name you chose in step 1
  useCdn: false, // `false` if you want to ensure fresh data
  ignoreBrowserTokenWarning: true,
})
```

Sanity uses `groq` to make their requests so make sure to install `yarn add groq`. Now let's use `groq` to make a fetch for all of our posts. 

As a side note, if you haven't used Sanity's [Vision](https://www.sanity.io/docs/the-vision-plugin) on their site, it make's testing requests very easy. 

We'll start with `import groq from 'groq'` and `import client from '../lib/sanity'`. I'll add in a `Post` type to have Typescript not yell at me. 

```tsx
type Post = {
  title: string;
  body: string;
  slug: object;
  _createdAt: Date;
};
```

We will then add in our `groq` request. 

```tsx
const postsQuery = groq`*[_type == "post"] | order(_createdAt asc,) {
  title,
  author,
  category,
  body,
  publishedAt,
  slug
}`
```

Lastly, we will use our sanity `client` to make a fetch request for all of that data.

```tsx
export async function getPosts(): Promise<Array<Post>> {
  return await client.fetch(postsQuery);
}
```

Here is what your whole file should look like. 
### models/post.server.tsx
```tsx
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

Now, we need create a page that will hold our list of posts. Create a file called `routes/posts/index.tsx`. We will also need a couple of imports, that are specific to Remix and our `getPosts` function from `post.server`. 

```tsx
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { getPosts } from "~/models/post.server";
```

`LoaderFunction` is just a type for Typescript given to use by Remix and `getPosts` is that function that we created earlier to make a fetch request to Sanity. We will come back to the others in just a sec. 

To make our fetch request from the server, we are going to need a `loader` function. The `loader` function is how we will make our requests from the server instead of the client. 

Inside of `loader` is where we will make our `getPosts()` call and have that response returned inside of `json`. We will use `json` to return our response. 

```tsx
export const loader: LoaderFunction = async () => {
  const res = await getPosts()

  return json<LoaderData>({
    posts: res
  });
};
```

Now that we have our data, we need to use it on our `Posts` page. To get our data from the `loader`, we will use Remix's `useLoaderData` which will automatically get our data from our `loader` function. 

```tsx
const {posts} = useLoaderData<LoaderData>();
```

Then we will simply map over our posts, return a list of `Link`'s that route to our posts' slugs. 

```tsx
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
```

Your whole file should look like this. 
### posts/index.tsx
```tsx
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
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

Now that we have a list of our posts, we'll create a dynamic post page that we will be able to access all of our posts on. 

To create dynamic pages in Remix, you'll start the file name with a `$`. We will call ours `posts/$slug`. 

We will start off with our `loader` function. `loader` has access to some [Route Params](https://remix.run/docs/en/v1/guides/data-loading#route-params) that we will use to get the slug of the post we want to access. 

```tsx
export const loader: LoaderFunction = async ({params}) => {
  const {slug} = params
}
```

To make our `groq` request dynamic, I'm going to create the function inside of our loader function and use that `slug` to make the request to our specific post. Then just like in our `index.tsx` file, we will return the fetch request inside of `json`. 

```tsx
export const loader: LoaderFunction = async ({params}) => {
  const {slug} = params
  const postData = groq`*[_type == "post" && slug.current == "${slug}"] [0]{
    title,
    author,
    category,
    body,
    publishedAt,
    slug
  }`
  const post = await client.fetch(postData)
  return json({post})
}
```

We are going to destructure `post` from `useLoaderData()` and make use of another import, [marked](https://github.com/markedjs/marked). We are going to be using `marked` to parse our markdown that we are getting from Sanity.  

We create a variable called `html` and set that equal to the body of our post wrapped by `marked` -> `  const html = marked(post.body[0].children[0].text)`.

Inside of an `h1`, we will put our title and inside of a dive, we will set our `html` inside of `dangerouslySetInnerHTML`. 

```tsx
export default function PostRoute() {
  const {post} = useLoaderData()
  const html = marked(post.body[0].children[0].text)
  return (
    <main>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{__html: html}}/>
    </main>
  )
}
```

AND THAT'S IT!

You should have a completely working, simple, blog. 