import { request } from "./client.js";
export function queryString(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined)
      query.set(key, String(value));
  });
  return query.toString();
}
export const studentsApi = {
  list: (params, signal) =>
    request(`/api/requests?${queryString(params)}`, { signal }),
  get: (id, signal) =>
    request(`/api/requests/${encodeURIComponent(id)}`, { signal }),
  create: (body) => request("/api/requests", { method: "POST", body }),
  update: (id, body) =>
    request(`/api/requests/${encodeURIComponent(id)}`, { method: "PUT", body }),
  remove: (id) =>
    request(`/api/requests/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
