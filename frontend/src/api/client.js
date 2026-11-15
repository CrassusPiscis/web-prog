export class ApiError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
export async function request(path, { body, ...options } = {}) {
  try {
    const headers = new Headers(options.headers);
    if (body !== undefined) headers.set("Content-Type", "application/json");
    const response = await fetch(path, {
      ...options,
      headers,
      credentials: "same-origin",
      cache: "no-store",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const result =
      response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      if (typeof window !== "undefined" && !path.startsWith("/api/auth/")) {
        if (response.status === 401)
          window.dispatchEvent(new Event("session-ended"));
        if (response.status === 403)
          window.dispatchEvent(new Event("permissions-changed"));
      }
      throw new ApiError(
        response.status,
        result?.error?.message || "Не удалось выполнить запрос",
        result?.error?.details,
      );
    }
    return result;
  } catch (error) {
    if (error.name === "AbortError" || error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      "Нет связи с сервером. Проверьте подключение и повторите запрос.",
    );
  }
}
