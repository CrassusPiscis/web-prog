export default function Unavailable() {
  return (
    <main className="container content">
      <h1>Java-сервер недоступен</h1>
      <p>Проверьте запуск backend и базы данных, затем обновите страницу.</p>
      <a className="button" href="/students">
        Повторить подключение
      </a>
    </main>
  );
}
