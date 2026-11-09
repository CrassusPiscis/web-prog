import { Link, NavLink, Outlet } from "react-router";
import { useAuth } from "../auth/useAuth";
export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="topbar">
        <div className="container nav">
          <Link className="brand" to="/students">
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
            <NavLink to="/students">
              <img
                className="nav-photo"
                src="/images/univer/lunch-break.jpg"
                alt=""
                width="56"
                height="56"
              />
              Студенты
            </NavLink>
            <NavLink to="/profile">
              <img
                className="nav-photo"
                src="/images/univer/session-mood.jpg"
                alt=""
                width="56"
                height="56"
              />
              Профиль
            </NavLink>
          </nav>
          <div className="account">
            <span className="badge">
              {user?.role === "ADMIN" ? "Администратор" : "Пользователь"}
            </span>
            <span>{user?.username}</span>
            <button className="secondary small" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main className="container content">
        <Outlet />
      </main>
      <footer className="container footer">
        Новая общага · Свои люди, свои комнаты
      </footer>
    </>
  );
}
