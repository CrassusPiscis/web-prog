import StudentDetailsPage from "../../../../views/StudentDetailsPage";
import { loadStudents } from "../../../../server/data";
import { notFound } from "next/navigation";

export default async function Student({ params }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  const student = await loadStudents(`/api/requests/${id}`);
  return <StudentDetailsPage student={student} />;
}
