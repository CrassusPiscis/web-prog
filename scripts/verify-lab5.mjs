// Integration checks against a running Compose project. Creates/removes one
// student; existing student records are never edited. Secrets are not printed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomInt } from "node:crypto";

const env = Object.fromEntries(readFileSync(new URL("../.env", import.meta.url), "utf8")
  .split(/\r?\n/).filter(line => line && !line.startsWith("#") && line.includes("="))
  .map(line => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).replace(/^['"]|['"]$/g, "")]));
const base = process.env.LAB5_URL || `http://localhost:${env.FRONTEND_PORT || 8080}`;
const jar = new Map();
async function call(path, { body, ...options } = {}) {
  const response = await fetch(base + path, {
    redirect: "manual", ...options,
    headers: {
      Origin: base,
      Cookie: [...jar].map(([key, value]) => `${key}=${value}`).join("; "),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  for (const cookie of response.headers.getSetCookie()) {
    const [name, value] = cookie.split(";")[0].split("=");
    if (value) jar.set(name, value); else jar.delete(name);
  }
  return response;
}
async function json(path, options) {
  const response = await call(path, options);
  assert.ok(response.ok, `${path}: HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}

let createdId;
try {
  assert.equal((await call("/students")).status, 307);
  assert.equal((await call("/api/requests")).status, 401);
  assert.equal((await call("/api/auth/login", { method: "POST", body: {}, headers: { Origin: "https://evil.example" } })).status, 403);
  const login = await call("/api/auth/login", { method: "POST", body: { username: env.BOOTSTRAP_ADMIN_USERNAME || "admin", password: env.BOOTSTRAP_ADMIN_PASSWORD } });
  assert.equal(login.status, 200);
  assert.deepEqual(await login.json(), { ok: true });
  assert.ok(login.headers.getSetCookie().every(value => /HttpOnly/i.test(value) && /SameSite=Lax/i.test(value)));
  assert.equal((await json("/api/users/me")).role, "ADMIN");
  const query = `/api/requests?isuId=${randomInt(10000000, 99999999)}`;
  const isuId = Number(new URLSearchParams(query.split("?")[1]).get("isuId"));
  assert.equal((await json(query)).total, 0); // Prime the empty cache.
  const body = { fullName: `Проверка Next ${Date.now()}`, group: "P3320", isuId,
    dormitory: "Белорусская улица, 6", room: 42, moveInDate: "2026-11-15", foreigner: false, notes: "Временная проверка lab5" };
  const student = await json("/api/requests", { method: "POST", body });
  createdId = student.id;
  assert.equal((await json(query)).total, 1, "create must invalidate list cache");
  let detail = await call(`/students/${createdId}`);
  assert.equal(detail.status, 200);
  assert.ok((await detail.text()).includes(body.fullName), "student must exist in SSR HTML");
  await json(`/api/requests/${createdId}`); // Prime detail cache.
  body.fullName += " изменён";
  await json(`/api/requests/${createdId}`, { method: "PUT", body });
  assert.equal((await json(`/api/requests/${createdId}`)).fullName, body.fullName, "update must invalidate detail cache");
  assert.ok((await (await call(`/students/${createdId}`)).text()).includes(body.fullName));
  assert.ok((await (await call("/students")).text()).includes("Найдено записей"), "list must be rendered before JS");
  // A missing access cookie with a valid refresh cookie must recover in the
  // same SSR request, and renew HttpOnly cookies on the response.
  jar.delete("dormitory_access");
  const refreshed = await call(`/students/${createdId}`);
  assert.equal(refreshed.status, 200);
  assert.ok(jar.has("dormitory_access"));
  assert.ok((await refreshed.text()).includes(body.fullName));
  await json(`/api/requests/${createdId}`, { method: "DELETE" });
  createdId = null;
  assert.equal((await json(query)).total, 0, "delete must invalidate cache");
  assert.equal((await call("/api/requests/999999999999")).status, 404);
  assert.equal((await call("/does-not-exist")).status, 404);
  await json("/api/auth/logout", { method: "POST" });
  assert.equal(jar.size, 0);
  assert.equal((await call("/profile")).status, 307);
  console.log("PASS: redirect, 401, CSRF, HttpOnly login, role, SSR, CRUD/cache, refresh, 404, logout");
} finally {
  if (createdId) {
    const cleanup = await call(`/api/requests/${createdId}`, { method: "DELETE" });
    assert.equal(cleanup.status, 204, "temporary student cleanup failed");
  }
}
