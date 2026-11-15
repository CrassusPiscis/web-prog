"use client";
import Link, { useLinkStatus } from "next/link";

function Pending() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span role="status" aria-label="Загрузка страницы">
      {" "}
      …
    </span>
  ) : null;
}

export default function NavigationLink({ children, ...props }) {
  return (
    <Link {...props}>
      {children}
      <Pending />
    </Link>
  );
}
