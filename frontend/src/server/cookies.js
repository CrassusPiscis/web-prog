export const ACCESS_COOKIE = "dormitory_access";
export const REFRESH_COOKIE = "dormitory_refresh";

function tokenLifetime(token, fallback) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url"));
    return Math.max(1, Math.floor(payload.exp - Date.now() / 1000));
  } catch {
    return fallback;
  }
}

export function setSessionCookies(response, tokens) {
  // Decoding here only sets cookie lifetime; signature/identity are checked by Java.
  const common = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
  };
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...common,
    maxAge: tokenLifetime(tokens.accessToken, 900),
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...common,
    maxAge: tokenLifetime(tokens.refreshToken, 604800),
  });
}

export function deleteSessionCookies(response) {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}
