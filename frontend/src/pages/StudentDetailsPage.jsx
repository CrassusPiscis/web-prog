import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../auth/useAuth";
import { studentsApi } from "../api/studentsApi";
import { ErrorMessage, Loading } from "../components/Feedback";
export default function StudentDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    const controller = new AbortController();
    studentsApi
      .get(id, controller.signal)
      .then((student) => setState({ student, loading: false }))
      .catch((error) => {
        if (!controller.signal.aborted) setState({ error, loading: false });
      });
    return () => controller.abort();
  }, [id]);
  const student = state.student;
  return (
    <>
      <Link className="back-link" to="/students">
        ← Все студенты
      </Link>
      {state.loading && <Loading />}
      <ErrorMessage error={state.error} />
      {student && (
        <>
          <div className="page-heading">
            <div>
              <p className="eyebrow">КАРТОЧКА СТУДЕНТА / {student.id}</p>
              <h1>{student.fullName}</h1>
              <p className="muted">
                {student.group} · ИСУ {student.isuId}
              </p>
            </div>
            {user.role === "ADMIN" && (
              <Link className="button" to={`/students/${id}/edit`}>
                Редактировать
              </Link>
            )}
          </div>
          <section className="card">
            <dl className="details-grid">
              {[
                ["Общежитие", student.dormitory],
                ["Комната", student.room],
                ["Дата заселения", student.moveInDate],
                ["Иностранный студент", student.foreigner ? "Да" : "Нет"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div className="wide">
                <dt>Примечание</dt>
                <dd className="pre-wrap">{student.notes || "Не указано"}</dd>
              </div>
            </dl>
          </section>
        </>
      )}
    </>
  );
}
