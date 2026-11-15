import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { backendFetch, responseBody } from "./backend";
import { ACCESS_COOKIE } from "./cookies";

export const STUDENTS_TAG = "students";

export const requireUser = cache(async () => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/login");
  const response = await backendFetch("/api/users/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new Error("Не удалось загрузить профиль");
  return responseBody(response);
});

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/forbidden");
  return user;
}

export async function studentsResponse(path, token) {
  // Authorization header is part of the fetch cache key. A live /me check must
  // precede this function; cached data never authorizes a user by itself.
  return backendFetch(path, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "force-cache",
    next: { revalidate: 60, tags: [STUDENTS_TAG] },
  });
}

export async function loadStudents(path) {
  await requireUser();
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const response = await studentsResponse(path, token);
  if (response.status === 404) notFound();
  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new Error("Не удалось загрузить студентов");
  return responseBody(response);
}
