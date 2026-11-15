import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";
import { authApi } from "../api/authApi";
import { ErrorMessage, Loading } from "../components/Feedback";
import { validateCredentials } from "../utils/validation";
import UniverGallery from "../components/UniverGallery";

export default function AuthPage({ registering = false }) {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  if (!ready) return <Loading />;
  if (user) return <Navigate to="/students" replace />;
  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const nextErrors = validateCredentials(form, registering);
    setErrors(nextErrors);
    setError(null);
    if (Object.keys(nextErrors).length) return;
    lock.current = true;
    setBusy(true);
    const credentials = {
      username: form.username.trim(),
      password: form.password,
    };
    try {
      if (registering)
        await authApi.register({ ...credentials, email: form.email.trim() });
      await login(credentials);
      const from = location.state?.from;
      navigate(
        typeof from === "string" &&
          from.startsWith("/") &&
          !from.startsWith("//")
          ? from
          : "/students",
        { replace: true },
      );
    } catch (reason) {
      setError(reason);
      setErrors(reason.details || {});
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="auth-shell">
      <aside className="auth-story">
        <Link className="brand" to="/">
          Новая общага
        </Link>
        <div>
          <p className="eyebrow">УНИВЕР / ДОБРО ПОЖАЛОВАТЬ ДОМОЙ</p>
          <h1>
            Свои люди.
            <br />
            Свои комнаты.
            <br />
            <span>Новая общага.</span>
          </h1>
          <p>
            Удобный учёт студентов общежития.
            <br />
            Заселяемся, учимся и держим всё под контролем.
          </p>
        </div>
        <UniverGallery compact />
        <p className="story-footer">
          Новая общага · Система управления студентами
        </p>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <p className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</p>
          <h1>{registering ? "Создать аккаунт" : "С возвращением"}</h1>
          <p className="muted">
            {registering
              ? "Заполните данные, чтобы начать работу."
              : "Войдите, чтобы открыть список студентов."}
          </p>
          <ErrorMessage error={error} />
          <form onSubmit={submit} noValidate>
            <fieldset disabled={busy}>
              <label>
                Имя пользователя
                <input
                  name="username"
                  autoComplete="username"
                  value={form.username}
                  onChange={change}
                  aria-invalid={!!errors.username}
                />
                <small className="field-error">{errors.username}</small>
              </label>
              {registering && (
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={change}
                    aria-invalid={!!errors.email}
                  />
                  <small className="field-error">{errors.email}</small>
                </label>
              )}
              <label>
                Пароль
                <input
                  name="password"
                  type="password"
                  autoComplete={
                    registering ? "new-password" : "current-password"
                  }
                  value={form.password}
                  onChange={change}
                  aria-invalid={!!errors.password}
                />
                <small className="field-error">{errors.password}</small>
              </label>
              {registering && (
                <label>
                  Повторите пароль
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={change}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <small className="field-error">
                    {errors.confirmPassword}
                  </small>
                </label>
              )}
              <button className="full" type="submit">
                {busy
                  ? "Подождите…"
                  : registering
                    ? "Зарегистрироваться"
                    : "Войти →"}
              </button>
            </fieldset>
          </form>
          <p className="auth-switch">
            {registering ? "Уже есть аккаунт? " : "Впервые здесь? "}
            <Link to={registering ? "/login" : "/register"}>
              {registering ? "Войти" : "Зарегистрироваться"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
