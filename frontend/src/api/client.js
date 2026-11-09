import {
  clearSession,
  getTokens,
  saveTokens,
  sessionVersion,
} from "./session.js";

export class ApiError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function readResponse(response) {
  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.message ||
        (response.status >= 500
          ? "Ошибка сервера. Попробуйте позже."
          : "Не удалось выполнить запрос"),
      body?.error?.details,
    );
  }
  return body;
}

let refreshInFlight = null;
async function refreshTokens() {
  const version = sessionVersion();
  if (refreshInFlight?.version === version) return refreshInFlight.promise;
  const promise = (async () => {
    const { refreshToken } = getTokens();
    if (!refreshToken) throw new ApiError(401, "Войдите в систему");
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const tokens = await readResponse(response);
    if (sessionVersion() !== version)
      throw new ApiError(401, "Сессия завершена");
    saveTokens(tokens);
  })();
  refreshInFlight = { version, promise };
  try {
    await promise;
  } catch (error) {
    if (sessionVersion() === version && error.status === 401) clearSession();
    throw error;
  } finally {
    if (refreshInFlight?.promise === promise) refreshInFlight = null;
  }
}

// signal нужен RxJS и страницам для отмены устаревших запросов.
export async function request(path, { auth = true, body, ...options } = {}) {
  const version = sessionVersion();
  const send = () => {
    const headers = new Headers(options.headers);
    if (body !== undefined) headers.set("Content-Type", "application/json");
    if (auth && getTokens().accessToken)
      headers.set("Authorization", `Bearer ${getTokens().accessToken}`);
    return fetch(path, {
      ...options,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };
  try {
    let response = await send();
    if (auth && response.status === 401 && sessionVersion() === version) {
      await refreshTokens();
      options.signal?.throwIfAborted();
      if (sessionVersion() !== version)
        throw new ApiError(401, "Сессия завершена");
      response = await send(); // Ровно одна повторная попытка.
    }
    if (auth && response.status === 401 && sessionVersion() === version)
      clearSession();
    if (auth && response.status === 403)
      window.dispatchEvent(new Event("permissions-changed"));
    return await readResponse(response);
  } catch (error) {
    if (error.name === "AbortError" || error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      "Нет связи с сервером. Проверьте подключение и повторите запрос.",
    );
  }
}
