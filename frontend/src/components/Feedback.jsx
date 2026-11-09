export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" /> Загружаем данные…
    </div>
  );
}
export function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <div className="error" role="alert">
      <strong>
        {error.status === 404
          ? "Запись не найдена"
          : error.status === 403
            ? "Недостаточно прав"
            : "Не удалось выполнить действие"}
      </strong>
      <p>{error.message || String(error)}</p>
      {Object.entries(error.details || {}).map(([field, message]) => (
        <p key={field}>{message}</p>
      ))}
    </div>
  );
}
