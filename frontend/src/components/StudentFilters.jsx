function StudentFilters({ search,
    onSearchChange,
    dormitory,
    onDormitoryChange,
    dormitories,
    sortBy,
    onSortChange,
}) {
    return (
    <section>
        <label>
        Поиск по ФИО:
        <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Введите имя студента"
        />
        </label>

        {search !== "" && (
        <button
            type="button"
            onClick={() => onSearchChange("")}
        >
            Очистить поиск
        </button>
        )}

        <label>
        Общежитие:
        <select
            value={dormitory}
            onChange={(event) => onDormitoryChange(event.target.value)}
        >
            <option value="">Все общежития</option>

            {dormitories.map((name) => (
            <option key={name} value={name}>
                {name}
            </option>
            ))}
        </select>
        </label>

        <label>
            Сортировка:
            <select
                value={sortBy}
                onChange={(event) => onSortChange(event.target.value)}
            >
                <option value="fullName">По ФИО: А–Я</option>
                <option value="room">По комнате: по возрастанию</option>
            </select>
        </label>
    </section>
    );
}

export default StudentFilters;