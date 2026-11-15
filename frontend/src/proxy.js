import { NextResponse } from "next/server";
import { backendFetch, responseBody } from "./server/backend";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  setSessionCookies,
  deleteSessionCookies,
} from "./server/cookies";
import { sameOriginMutation } from "./server/security";

// Next.js 16 calls middleware "Proxy". This runs before protected pages/API routes.
export async function proxy(request) {
  const path = request.nextUrl.pathname;
  const api = path.startsWith("/api/");
  if (!sameOriginMutation(request))
    return NextResponse.json(
      { error: { message: "Запрос с другого сайта запрещён" } },
      { status: 403 },
    );
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let tokens;
  const unauthorized = () => {
    const target = new URL("/login", request.url);
    target.searchParams.set("next", path + request.nextUrl.search);
    const response = api
      ? NextResponse.json(
          { error: { message: "Войдите в систему" } },
          { status: 401 },
        )
      : NextResponse.redirect(target);
    deleteSessionCookies(response);
    return response;
  };
  if (!accessToken && !refreshToken) return unauthorized();
  try {
    let me = accessToken
      ? await backendFetch("/api/users/me", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      : null;
    if ((!me || me.status === 401) && refreshToken) {
      const refreshed = await backendFetch("/api/auth/refresh", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshed.status === 401) return unauthorized();
      if (!refreshed.ok) throw new Error("Refresh unavailable");
      tokens = await responseBody(refreshed);
      accessToken = tokens.accessToken;
      me = await backendFetch("/api/users/me", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
    if (!me || me.status === 401) return unauthorized();
    if (!me.ok) throw new Error("Backend unavailable");
    const user = await responseBody(me);
    const adminPage =
      path === "/students/new" || /^\/students\/[^/]+\/edit\/?$/.test(path);
    const headers = new Headers(request.headers);
    // The refreshed cookies must be visible during this same SSR request.
    if (tokens) {
      const cookies = request.cookies
        .getAll()
        .filter(({ name }) => ![ACCESS_COOKIE, REFRESH_COOKIE].includes(name));
      cookies.push(
        { name: ACCESS_COOKIE, value: tokens.accessToken },
        { name: REFRESH_COOKIE, value: tokens.refreshToken },
      );
      headers.set(
        "cookie",
        cookies.map(({ name, value }) => `${name}=${value}`).join("; "),
      );
    }
    const response =
      adminPage && user.role !== "ADMIN"
        ? NextResponse.redirect(new URL("/forbidden", request.url))
        : NextResponse.next({ request: { headers } });
    if (tokens) setSessionCookies(response, tokens);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return api
      ? NextResponse.json(
          { error: { message: "Нет связи с Java-сервером" } },
          { status: 503 },
        )
      : NextResponse.rewrite(new URL("/unavailable", request.url), {
          status: 503,
        });
  }
}

export const config = {
  matcher: [
    "/students/:path*",
    "/profile",
    "/api/requests/:path*",
    "/api/users/:path*",
  ],
};
