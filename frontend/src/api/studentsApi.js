import { request } from "./client.js";
import { notifyStudentChanged } from "./studentEvents.js";
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
  create: async (body) => {
    const result = await request("/api/requests", {
      method: "POST",
      body,
    });

    notifyStudentChanged();
    return result;
  },
  update: async (id, body) => {
    const result = await request(`/api/requests/${encodeURIComponent(id)}`, {
      method: "PUT",
      body,
    });

    notifyStudentChanged();
    return result;
  },
  remove: async (id) => {
    const result = await request(`/api/requests/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    notifyStudentChanged();
    return result;
  },
};
