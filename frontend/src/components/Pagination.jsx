export default function Pagination({
  page,
  totalPages,
  total,
  loading,
  onChange,
}) {
  return (
    <div className="pagination">
      <span className="muted">Найдено записей: {total}</span>
      <div className="actions">
        <button
          className="secondary"
          disabled={loading || page === 0}
          onClick={() => onChange(page - 1)}
        >
          ← Назад
        </button>
        <span>
          Страница {totalPages === 0 ? 0 : page + 1} из {totalPages}
        </span>
        <button
          className="secondary"
          disabled={loading || totalPages === 0 || page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
}
