import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container content">
      <h1>Страница не найдена</h1>
      <p>Такой страницы или студента больше нет.</p>
      <Link href="/students">К списку студентов</Link>
    </main>
  );
}
