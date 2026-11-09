import { Link } from "react-router";
export default function StudentTable({ students, admin, onDelete, deleting }) {
  if (!students.length)
    return (
      <div className="empty card">
        <span className="empty-icon">⌕</span>
        <h2>Студенты не найдены</h2>
        <p>Измените условия поиска или добавьте первую запись.</p>
      </div>
    );
  return (
    <div className="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Студент</th>
            <th>Группа / ИСУ</th>
            <th>Общежитие</th>
            <th>Заселение</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>
                <Link className="student-name" to={`/students/${student.id}`}>
                  {student.fullName}
                </Link>
                <div className="muted">
                  ID {student.id}
                  {student.foreigner ? " · Иностранный студент" : ""}
                </div>
              </td>
              <td>
                <span className="badge neutral">{student.group}</span>
                <div className="muted">{student.isuId}</div>
              </td>
              <td>
                {student.dormitory}
                <div className="muted">Комната {student.room}</div>
              </td>
              <td>{student.moveInDate}</td>
              <td>
                <div className="actions">
                  <Link className="text-link" to={`/students/${student.id}`}>
                    Открыть
                  </Link>
                  {admin && (
                    <>
                      <Link
                        className="text-link"
                        to={`/students/${student.id}/edit`}
                      >
                        Изменить
                      </Link>
                      <button
                        className="danger-link"
                        disabled={deleting !== null}
                        onClick={() => onDelete(student)}
                      >
                        {deleting === student.id ? "Удаляем…" : "Удалить"}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
