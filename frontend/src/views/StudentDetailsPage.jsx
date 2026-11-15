"use client";
import Link from "next/link";
import { useAuth } from "../auth/useAuth";
import StudentSync from "../components/StudentSync";
export default function StudentDetailsPage({ student }) {
  const { user } = useAuth();
  return (
    <>
      <StudentSync />
      <Link className="back-link" href="/students">
        ← Все студенты
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">КАРТОЧКА СТУДЕНТА / {student.id}</p>
          <h1>{student.fullName}</h1>
          <p className="muted">
            {student.group} · ИСУ {student.isuId}
          </p>
        </div>
        {user.role === "ADMIN" && (
          <Link className="button" href={`/students/${student.id}/edit`}>
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
  );
}
