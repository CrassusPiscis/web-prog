import { test } from "node:test";
import assert from "node:assert/strict";
import { request } from "../src/api/client.js";
import { clearSession, getTokens, startSession } from "../src/api/session.js";
const storage = new Map();
globalThis.sessionStorage = {
  getItem: (key) => storage.get(key),
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = new EventTarget();
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("parallel 401 responses share a refresh and retry with new token", async () => {
  startSession({ accessToken: "old", refreshToken: "refresh" });
  let refreshes = 0;
  globalThis.fetch = async (url, options) => {
    if (url === "/api/auth/refresh") {
      refreshes++;
      await new Promise((r) => setTimeout(r, 10));
      return json({ accessToken: "new", refreshToken: "r2" });
    }
    return options.headers.get("Authorization") === "Bearer new"
      ? json({ ok: true })
      : json({ error: { message: "expired" } }, 401);
  };
  const result = await Promise.all([request("/one"), request("/two")]);
  assert.equal(refreshes, 1);
  assert.ok(result.every((value) => value.ok));
});

test("late refresh cannot restore session after logout", async () => {
  startSession({ accessToken: "old", refreshToken: "r" });
  let finish;
  globalThis.fetch = async (url) =>
    url === "/api/auth/refresh"
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : json({}, 401);
  const pending = request("/protected");
  while (!finish) await new Promise((r) => setTimeout(r, 0));
  clearSession();
  finish(json({ accessToken: "late", refreshToken: "late" }));
  await assert.rejects(pending, (error) => error.status === 401);
  assert.deepEqual(getTokens(), {});
});

test("403 does not refresh and 204 has no JSON body", async () => {
  startSession({ accessToken: "token", refreshToken: "r" });
  let refreshes = 0;
  globalThis.fetch = async (url) => {
    if (url.includes("refresh")) refreshes++;
    return json({ error: { message: "forbidden" } }, 403);
  };
  await assert.rejects(request("/protected"), (error) => error.status === 403);
  assert.equal(refreshes, 0);
  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await request("/protected", { method: "DELETE" }), null);
});
