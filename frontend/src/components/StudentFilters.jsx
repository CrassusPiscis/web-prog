const fields = [
  ["id", "ID записи", "number"],
  ["fullName", "ФИО", "text"],
  ["group", "Группа", "text"],
  ["isuId", "ИСУ ID", "number"],
  ["dormitory", "Общежитие", "text"],
  ["room", "Комната", "number"],
  ["moveInDate", "Дата заселения", "date"],
  ["notes", "Примечание", "text"],
];
const sorts = [
  ["id", "ID"],
  ["fullName", "ФИО"],
  ["group", "Группа"],
  ["isuId", "ИСУ ID"],
  ["dormitory", "Общежитие"],
  ["room", "Комната"],
  ["moveInDate", "Дата заселения"],
  ["foreigner", "Иностранный студент"],
  ["notes", "Примечание"],
];
export default function StudentFilters({ query, onChange, onReset }) {
  return (
    <section className="card filters" aria-label="Поиск и фильтрация">
      <div className="search-row">
        <label className="search-label">
          Поиск студентов
          <input
            type="search"
            placeholder="ФИО, группа, общежитие или примечание…"
            value={query.search}
            onChange={(event) =>
              onChange({ search: event.target.value }, { debounce: true })
            }
          />
        </label>
        <button type="button" className="secondary" onClick={onReset}>
          Сбросить
        </button>
      </div>
      <details>
        <summary>Фильтры по всем полям</summary>
        <div className="filter-grid">
          {fields.map(([name, label, type]) => (
            <label key={name}>
              {label}
              <input
                type={type}
                min={type === "number" ? "1" : undefined}
                step={type === "number" ? "1" : undefined}
                value={query[name]}
                onChange={(event) =>
                  onChange(
                    { [name]: event.target.value },
                    { debounce: type !== "date" },
                  )
                }
              />
            </label>
          ))}
          <label>
            Иностранный студент
            <select
              value={query.foreigner}
              onChange={(event) => onChange({ foreigner: event.target.value })}
            >
              <option value="">Все</option>
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </label>
        </div>
      </details>
      <div className="sort-row">
        <label>
          Сортировать по
          <select
            value={query.sortBy}
            onChange={(event) => onChange({ sortBy: event.target.value })}
          >
            {sorts.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Порядок
          <select
            value={query.direction}
            onChange={(event) => onChange({ direction: event.target.value })}
          >
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </label>
        <label>
          На странице
          <select
            value={query.size}
            onChange={(event) => onChange({ size: Number(event.target.value) })}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
