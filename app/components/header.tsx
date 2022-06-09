import { Link } from "@remix-run/react";

export default function Header () {
  return (
    <div>
      <Link to="/posts">
        Posts
      </Link>
      <Link to="/">Home</Link>
    </div>
  )
}