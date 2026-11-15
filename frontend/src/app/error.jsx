"use client";
export default function ErrorPage({ reset }) {
  return (
    <main className="container content">
      <h1>Не удалось загрузить страницу</h1>
      <p>Проверьте, запущен ли Java-сервер, и повторите попытку.</p>
      <button onClick={reset}>Повторить</button>
    </main>
  );
}
