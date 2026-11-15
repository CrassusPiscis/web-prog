import StudentFormPage from "../../../../views/StudentFormPage";
import { requireAdmin } from "../../../../server/data";
export default async function NewStudent() {
  await requireAdmin();
  return <StudentFormPage />;
}
