export function sameOriginMutation(request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
  const origin = request.headers.get("origin");
  const expected = process.env.APP_ORIGIN || new URL(request.url).origin;
  return (
    origin === expected &&
    request.headers.get("sec-fetch-site") !== "cross-site"
  );
}

export function allowedApi(path, method) {
  if (["auth/login", "auth/register", "auth/logout"].includes(path))
    return method === "POST";
  if (path === "users/me") return method === "GET";
  if (path === "requests") return ["GET", "POST"].includes(method);
  return (
    /^requests\/[1-9]\d*$/.test(path) &&
    ["GET", "PUT", "DELETE"].includes(method)
  );
}

export function safeReturnPath(value) {
  // Restrict redirects to known application routes; reject encoded separators too.
  return typeof value === "string" &&
    /^\/(students(?:[/?]|$)|profile(?:[?]|$))/.test(value) &&
    !/[\\\r\n]/.test(value) &&
    !/%(?:2f|5c)/i.test(value)
    ? value
    : "/students";
}
