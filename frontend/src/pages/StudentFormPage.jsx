import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { studentsApi } from "../api/studentsApi";
import { ErrorMessage, Loading } from "../components/Feedback";
import { validateStudent } from "../utils/validation";
const dormitories = [
  "Белорусская улица, 6",
  "Вяземский переулок, 5-7",
  "Альпийский переулок, 15к2",
  "Улица Ленсовета, 23А",
  "Серебристый бульвар, 29 1А",
  "Не в общежитии",
];
const empty = {
  fullName: "",
  group: "",
  isuId: "",
  dormitory: "",
  room: "",
  moveInDate: "",
  foreigner: false,
  notes: "",
};
const fields = [
  ["fullName", "ФИО", "text"],
  ["group", "Группа", "text"],
  ["isuId", "ИСУ ID", "number"],
  ["dormitory", "Общежитие", "select"],
  ["room", "Комната", "number"],
  ["moveInDate", "Дата заселения", "date"],
];
export default function StudentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    if (id)
      studentsApi
        .get(id, controller.signal)
        .then((student) => setForm({ ...student, notes: student.notes || "" }))
        .catch((reason) => {
          if (!controller.signal.aborted) setLoadError(reason);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    return () => controller.abort();
  }, [id]);
  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const nextErrors = validateStudent(form);
    setErrors(nextErrors);
    setError(null);
    if (Object.keys(nextErrors).length) return;
    lock.current = true;
    setSaving(true);
    const body = {
      fullName: form.fullName.trim(),
      group: form.group.trim(),
      isuId: Number(form.isuId),
      dormitory: form.dormitory.trim(),
      room: Number(form.room),
      moveInDate: form.moveInDate,
      foreigner: form.foreigner,
      notes: form.notes.trim(),
    };
    try {
      const student = id
        ? await studentsApi.update(id, body)
        : await studentsApi.create(body);
      navigate(`/students/${student.id}`, { replace: true });
    } catch (reason) {
      setError(reason);
      setErrors(reason.details || {});
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  return (
    <>
      <Link className="back-link" to="/students">
        ← Все студенты
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">УПРАВЛЕНИЕ ЗАПИСЯМИ</p>
          <h1>{id ? "Редактирование" : "Новый студент"}</h1>
          <p className="muted">
            Поля со звёздочкой обязательны для заполнения.
          </p>
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : loadError ? (
        <ErrorMessage error={loadError} />
      ) : (
        <form className="card student-form" noValidate onSubmit={submit}>
          <ErrorMessage error={error} />
          <fieldset disabled={saving}>
            <div className="form-grid">
              {fields.map(([name, label, type]) => (
                <label key={name}>
                  {label} *
                  {type === "select" ? (
                    <select
                      name={name}
                      value={form[name]}
                      onChange={change}
                      required
                      aria-invalid={!!errors[name]}
                    >
                      <option value="">Выберите общежитие</option>
                      {form.dormitory &&
                        !dormitories.includes(form.dormitory) && (
                          <option value={form.dormitory}>
                            {form.dormitory}
                          </option>
                        )}
                      {dormitories.map((address) => (
                        <option key={address} value={address}>
                          {address}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={name}
                      type={type}
                      value={form[name]}
                      onChange={change}
                      min={type === "number" ? 1 : undefined}
                      step={type === "number" ? 1 : undefined}
                      aria-invalid={!!errors[name]}
                    />
                  )}
                  <small className="field-error">{errors[name]}</small>
                </label>
              ))}
              <label className="checkbox wide">
                <input
                  name="foreigner"
                  type="checkbox"
                  checked={form.foreigner}
                  onChange={change}
                />
                Иностранный студент
              </label>
              <label className="wide">
                Примечание
                <textarea
                  name="notes"
                  rows={4}
                  value={form.notes}
                  onChange={change}
                />
              </label>
            </div>
            <div className="form-actions">
              <Link className="button secondary" to="/students">
                Отмена
              </Link>
              <button type="submit">
                {saving
                  ? "Сохраняем…"
                  : id
                    ? "Сохранить изменения"
                    : "Добавить студента"}
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </>
  );
}
