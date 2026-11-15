import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { ErrorMessage } from "../components/Feedback";
export default function ProfilePage() {
  const { user: current, logout, refreshUser } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      await refreshUser();
    } catch (reason) {
      setError(reason);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</p>
          <h1>Мой профиль</h1>
          <p className="muted">Данные вашего аккаунта и права доступа.</p>
        </div>
      </div>
      <section className="card profile">
        <div className="avatar">
          {current.username.slice(0, 1).toUpperCase()}
        </div>
        <h2>{current.username}</h2>
        <span className="badge">
          {current.role === "ADMIN" ? "Администратор" : "Пользователь"}
        </span>
        <dl className="details-grid">
          <div>
            <dt>ID аккаунта</dt>
            <dd>{current.id}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{current.email}</dd>
          </div>
        </dl>
        <p className="muted">
          {current.role === "ADMIN"
            ? "Вы можете просматривать, добавлять, изменять и удалять студентов."
            : "Вам доступны список и карточки студентов. Изменения выполняет администратор."}
        </p>
        <ErrorMessage error={error} />
        <div className="actions">
          <button className="secondary" disabled={loading} onClick={refresh}>
            {loading ? "Обновляем…" : "Обновить данные"}
          </button>
          <button onClick={logout}>Выйти из аккаунта</button>
        </div>
      </section>
    </>
  );
}
