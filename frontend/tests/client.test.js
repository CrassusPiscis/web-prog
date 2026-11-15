import { test } from "node:test";
import assert from "node:assert/strict";
import { request } from "../src/api/client.js";
globalThis.window = new EventTarget();
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("client uses same-origin cookies and never reads browser token storage", async () => {
  globalThis.sessionStorage = {
    getItem: () => {
      throw new Error("Tokens must not be in JS");
    },
  };
  globalThis.fetch = async (url, options) => {
    assert.equal(options.credentials, "same-origin");
    assert.equal(options.headers.has("Authorization"), false);
    assert.equal(options.cache, "no-store");
    return json({ ok: true });
  };
  assert.equal((await request("/api/users/me")).ok, true);
});
test("401 ends session, 403 updates permissions; login errors do not redirect", async () => {
  let ended = 0,
    changed = 0;
  const onEnd = () => ended++,
    onChange = () => changed++;
  window.addEventListener("session-ended", onEnd);
  window.addEventListener("permissions-changed", onChange);
  try {
    globalThis.fetch = async () =>
      json({ error: { message: "Unauthorized" } }, 401);
    await assert.rejects(
      request("/api/requests"),
      (error) => error.status === 401,
    );
    await assert.rejects(
      request("/api/auth/login", { method: "POST", body: {} }),
      (error) => error.status === 401,
    );
    assert.equal(ended, 1);
    globalThis.fetch = async () =>
      json({ error: { message: "Forbidden" } }, 403);
    await assert.rejects(
      request("/api/requests"),
      (error) => error.status === 403,
    );
    assert.equal(changed, 1);
  } finally {
    window.removeEventListener("session-ended", onEnd);
    window.removeEventListener("permissions-changed", onChange);
  }
});
test("204, validation details and AbortError survive transport", async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await request("/api/requests/1", { method: "DELETE" }), null);
  globalThis.fetch = async () =>
    json(
      { error: { message: "Invalid", details: { fullName: "Required" } } },
      400,
    );
  await assert.rejects(
    request("/api/requests"),
    (error) => error.details.fullName === "Required",
  );
  const abort = new DOMException("Aborted", "AbortError");
  globalThis.fetch = async () => {
    throw abort;
  };
  await assert.rejects(request("/api/requests"), (error) => error === abort);
});
