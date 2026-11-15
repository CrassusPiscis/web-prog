import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sameOriginMutation,
  allowedApi,
  safeReturnPath,
} from "../src/server/security.js";

test("cookie-authenticated writes require matching Origin (including login/logout)", () => {
  const previous = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = "http://localhost:8080";
  const req = (origin, method = "POST") =>
    new Request("http://localhost:8080/api/auth/login", {
      method,
      headers: origin ? { origin } : {},
    });
  try {
    assert.equal(sameOriginMutation(req("http://localhost:8080")), true);
    assert.equal(sameOriginMutation(req("https://evil.example")), false);
    assert.equal(sameOriginMutation(req(null)), false);
    assert.equal(sameOriginMutation(req(null, "GET")), true);
  } finally {
    if (previous === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = previous;
  }
});
test("BFF only exposes existing operations and never arbitrary backend paths", () => {
  assert.equal(allowedApi("requests/123", "PUT"), true);
  assert.equal(allowedApi("auth/login", "GET"), false);
  assert.equal(allowedApi("auth/refresh", "POST"), false);
  assert.equal(allowedApi("../actuator/env", "GET"), false);
  assert.equal(allowedApi("requests/0", "DELETE"), false);
});
test("login redirect cannot leave application", () => {
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/students/%2f%2fevil",
    "/login",
    undefined,
  ]) {
    assert.equal(safeReturnPath(value), "/students");
  }
  assert.equal(safeReturnPath("/students/12/edit"), "/students/12/edit");
});
