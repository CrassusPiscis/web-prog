import { useRef, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../auth/useAuth";
import { studentsApi } from "../api/studentsApi";
import useStudents from "../hooks/useStudents";
import StudentFilters from "../components/StudentFilters";
import StudentTable from "../components/StudentTable";
import Pagination from "../components/Pagination";
import { ErrorMessage, Loading } from "../components/Feedback";
export default function StudentsPage() {
  const { user } = useAuth();
  const { data, query, loading, error, update, reset, reload } = useStudents();
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const deleteLock = useRef(false);
  async function removeStudent(student) {
    if (
      deleteLock.current ||
      !window.confirm(`Удалить запись «${student.fullName}»?`)
    )
      return;
    deleteLock.current = true;
    setDeleting(student.id);
    setDeleteError(null);
    try {
      await studentsApi.remove(student.id);
      reload();
    } catch (reason) {
      setDeleteError(reason);
    } finally {
      setDeleting(null);
      deleteLock.current = false;
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ОБЩЕЖИТИЕ / УЧЁТ</p>
          <h1>Студенты</h1>
          <p className="muted">
            Все записи, комнаты и даты заселения — в одном месте.
          </p>
        </div>
        {user.role === "ADMIN" && (
          <Link className="button" to="/students/new">
            ＋ Добавить студента
          </Link>
        )}
      </div>
      <StudentFilters query={query} onChange={update} onReset={reset} />
      <ErrorMessage error={deleteError || error} />
      {error && (
        <button className="secondary" onClick={reload}>
          Повторить запрос
        </button>
      )}
      {loading && <Loading />}
      {!loading && data && (
        <>
          <StudentTable
            students={data.items}
            admin={user.role === "ADMIN"}
            onDelete={removeStudent}
            deleting={deleting}
          />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            loading={loading}
            onChange={(page) => update({ page })}
          />
        </>
      )}
    </>
  );
}
