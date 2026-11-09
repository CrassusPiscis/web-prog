import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./useAuth";
import { ErrorMessage, Loading } from "../components/Feedback";

export default function ProtectedRoute({ admin = false }) {
  const { user, ready, error, retry, logout } = useAuth();
  const location = useLocation();
  if (!ready) return <Loading />;
  if (error)
    return (
      <main className="container">
        <ErrorMessage error={error} />
        <button onClick={retry}>Повторить подключение</button>{" "}
        <button className="secondary" onClick={logout}>
          Выйти
        </button>
      </main>
    );
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  if (admin && user.role !== "ADMIN")
    return (
      <main className="container">
        <h1>Недостаточно прав</h1>
        <p>Изменять записи может только администратор.</p>
        <a href="/students">К списку студентов</a>
      </main>
    );
  return <Outlet />;
}
