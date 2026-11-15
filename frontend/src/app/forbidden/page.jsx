import Link from "next/link";
export default function Forbidden() {
  return (
    <main className="container content">
      <h1>Недостаточно прав</h1>
      <p>Изменять записи может только администратор.</p>
      <Link href="/students">К списку студентов</Link>
    </main>
  );
}
