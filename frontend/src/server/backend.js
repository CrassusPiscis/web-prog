// Only Next's server imports this module. Java remains the source of truth.
export const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export function backendFetch(path, options = {}) {
  return fetch(`${backendUrl}${path}`, {
    ...options,
    signal: options.signal || AbortSignal.timeout(15000),
  });
}

export async function responseBody(response) {
  if (response.status === 204) return null;
  return response.json().catch(() => null);
}
