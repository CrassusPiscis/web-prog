import { test } from "node:test";
import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
import { createStudentsStream } from "../src/reactive/studentsStream.js";
import { queryString } from "../src/api/studentsApi.js";
import {
  validateStudent,
  validateCredentials,
} from "../src/utils/validation.js";

test("new query aborts old HTTP request and late result cannot overwrite new data", async () => {
  const requests = [];
  const stream = createStudentsStream(
    (params, signal) =>
      new Promise((resolve) => requests.push({ params, signal, resolve })),
    0,
  );
  const states = [];
  const subscription = stream.state$.subscribe((value) => states.push(value));
  await wait(10);
  stream.update({ search: "new" });
  await wait(10);
  assert.equal(requests[0].signal.aborted, true);
  requests[1].resolve({ items: ["new"] });
  await wait(0);
  requests[0].resolve({ items: ["old"] });
  await wait(0);
  assert.deepEqual(states.at(-1).data.items, ["new"]);
  subscription.unsubscribe();
});

test("typing is debounced, errors do not terminate stream, and filters reset page", async () => {
  const calls = [];
  const stream = createStudentsStream(async (params) => {
    calls.push(params);
    if (params.search === "fail") throw new Error("offline");
    return { items: [params.search] };
  }, 20);
  const states = [];
  const subscription = stream.state$.subscribe((value) => states.push(value));
  await wait(10);
  stream.update({ page: 3 });
  await wait(10);
  stream.update({ search: "a" }, { debounce: true });
  stream.update({ search: "fail" }, { debounce: true });
  await wait(40);
  assert.equal(
    calls.some((p) => p.search === "a"),
    false,
  );
  assert.equal(states.at(-1).error.message, "offline");
  assert.equal(states.at(-1).query.page, 0);
  stream.update({ search: "works" });
  await wait(10);
  assert.deepEqual(states.at(-1).data.items, ["works"]);
  subscription.unsubscribe();
});

test("query preserves false and zero values", () => {
  assert.equal(
    queryString({ page: 0, foreigner: false, search: "", group: "P3320" }),
    "page=0&foreigner=false&group=P3320",
  );
});

test("student validation rejects whitespace, unsafe ID and fractional room", () => {
  const errors = validateStudent({
    fullName: " ",
    group: "bad",
    isuId: "9007199254740992",
    dormitory: "",
    room: "1.5",
    moveInDate: "",
  });
  for (const field of [
    "fullName",
    "group",
    "isuId",
    "dormitory",
    "room",
    "moveInDate",
  ])
    assert.ok(errors[field]);
});

test("registration checks password confirmation and UTF-8 byte limit", () => {
  const errors = validateCredentials(
    {
      username: "reader",
      email: "a@example.com",
      password: "я".repeat(40),
      confirmPassword: "other",
    },
    true,
  );
  assert.ok(errors.password);
  assert.ok(errors.confirmPassword);
});
