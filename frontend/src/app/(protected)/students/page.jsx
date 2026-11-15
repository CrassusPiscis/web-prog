import StudentsPage from "../../../views/StudentsPage";
import { loadStudents } from "../../../server/data";
import { initialQuery } from "../../../utils/studentQuery";
import { queryString } from "../../../api/studentsApi";

export default async function Students() {
  const data = await loadStudents(`/api/requests?${queryString(initialQuery)}`);
  return <StudentsPage initialData={data} />;
}
