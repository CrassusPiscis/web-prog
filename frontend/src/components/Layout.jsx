"use client";
import Link from "./NavigationLink";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ErrorMessage } from "./Feedback";
import { useAuth } from "../auth/useAuth";
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [error, setError] = useState(null);
  const [leaving, setLeaving] = useState(false);
  async function leave() {
    setLeaving(true);
    setError(null);
    try {
      await logout();
    } catch (reason) {
      setError(reason);
      setLeaving(false);
    }
  }
  return (
    <>
      <header className="topbar">
        <div className="container nav">
          <Link className="brand" href="/students">
            <img
              className="brand-photo"
              src="/images/univer/general-mayo.jpg"
              alt="Генерал Майонез"
              width="64"
              height="64"
            />
            Новая общага
          </Link>
          <nav>
            <Link
              href="/students"
              className={pathname.startsWith("/students") ? "active" : ""}
            >
              <img
                className="nav-photo"
                src="/images/univer/lunch-break.jpg"
                alt=""
                width="56"
                height="56"
              />
              Студенты
            </Link>
            <Link
              href="/profile"
              className={pathname === "/profile" ? "active" : ""}
            >
              <img
                className="nav-photo"
                src="/images/univer/session-mood.jpg"
                alt=""
                width="56"
                height="56"
              />
              Профиль
            </Link>
          </nav>
          <div className="account">
            <span className="badge">
              {user?.role === "ADMIN" ? "Администратор" : "Пользователь"}
            </span>
            <span>{user?.username}</span>
            <button
              className="secondary small"
              disabled={leaving}
              onClick={leave}
            >
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main className="container content">
        <ErrorMessage error={error} />
        {children}
      </main>
      <footer className="container footer">
        Новая общага · Свои люди, свои комнаты
      </footer>
    </>
  );
}
