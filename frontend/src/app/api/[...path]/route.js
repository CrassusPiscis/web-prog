import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { backendFetch, responseBody } from "../../../server/backend";
import {
  ACCESS_COOKIE,
  setSessionCookies,
  deleteSessionCookies,
} from "../../../server/cookies";
import { allowedApi, sameOriginMutation } from "../../../server/security";
import { studentsResponse, STUDENTS_TAG } from "../../../server/data";

export const runtime = "nodejs";

async function handle(request, context) {
  const { path: segments } = await context.params;
  const path = segments.join("/");
  if (!allowedApi(path, request.method))
    return NextResponse.json(
      { error: { message: "Маршрут не найден" } },
      { status: 404 },
    );
  if (!sameOriginMutation(request))
    return NextResponse.json(
      { error: { message: "Запрос с другого сайта запрещён" } },
      { status: 403 },
    );
  if (path === "auth/logout") {
    const response = NextResponse.json({ ok: true });
    deleteSessionCookies(response);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  try {
    const isAuth = path.startsWith("auth/");
    const token = request.cookies.get(ACCESS_COOKIE)?.value;
    if (!isAuth && !token)
      return NextResponse.json(
        { error: { message: "Войдите в систему" } },
        { status: 401 },
      );
    const target = `/api/${path}${request.nextUrl.search}`;
    const response =
      request.method === "GET" && path.startsWith("requests")
        ? await studentsResponse(target, token)
        : await backendFetch(target, {
            method: request.method,
            cache: "no-store",
            headers: {
              ...(token && !isAuth ? { Authorization: `Bearer ${token}` } : {}),
              ...(request.method !== "GET"
                ? { "Content-Type": "application/json" }
                : {}),
            },
            body: request.method === "GET" ? undefined : await request.text(),
          });
    const body = await responseBody(response);
    let result;
    if (path === "auth/login" && response.ok) {
      result = NextResponse.json({ ok: true });
      setSessionCookies(result, body);
    } else {
      result =
        response.status === 204
          ? new NextResponse(null, { status: 204 })
          : NextResponse.json(
              body || { error: { message: "Некорректный ответ Java-сервера" } },
              { status: response.status },
            );
    }
    if (
      response.ok &&
      path.startsWith("requests") &&
      request.method !== "GET"
    ) {
      // Expire immediately, so the next read waits for fresh data after a write.
      revalidateTag(STUDENTS_TAG, { expire: 0 });
    }
    result.headers.set("Cache-Control", "private, no-store");
    return result;
  } catch {
    return NextResponse.json(
      { error: { message: "Нет связи с Java-сервером. Повторите запрос." } },
      { status: 503 },
    );
  }
}
export { handle as GET, handle as POST, handle as PUT, handle as DELETE };
