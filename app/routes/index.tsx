import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="m-2">
      <h1 className="text-3xl text-center">Welcome to My Remix Blog</h1>
      <ul>
        <li className="text-2xl text-blue-800">
          <Link to="/posts">
            Posts
          </Link>
        </li>
      </ul>
    </div>
  );
}
