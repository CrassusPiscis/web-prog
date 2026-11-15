import { request } from "./client";
export const authApi = {
  login: (body) => request("/api/auth/login", { method: "POST", body }),
  register: (body) => request("/api/auth/register", { method: "POST", body }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: (signal) => request("/api/users/me", { signal }),
};
