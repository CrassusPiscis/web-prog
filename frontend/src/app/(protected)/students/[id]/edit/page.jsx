import StudentFormPage from "../../../../../views/StudentFormPage";
import { requireAdmin, loadStudents } from "../../../../../server/data";
import { notFound } from "next/navigation";
export default async function EditStudent({ params }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  const student = await loadStudents(`/api/requests/${id}`);
  return <StudentFormPage id={id} initialStudent={student} />;
}
