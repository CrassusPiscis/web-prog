import { request } from "./client";
export const authApi = {
  login: (body) =>
    request("/api/auth/login", { method: "POST", body, auth: false }),
  register: (body) =>
    request("/api/auth/register", { method: "POST", body, auth: false }),
  me: (signal) => request("/api/users/me", { signal }),
};
