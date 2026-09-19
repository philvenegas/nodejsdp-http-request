// undici ships MockAgent, but must be installed
// as a dev dependency even though it already
// powers the built-in fetch().

import assert from "node:assert/strict";
import {
  afterEach,
  beforeEach,
  describe,
  it,
} from "node:test";
import {
  getGlobalDispatcher,
  MockAgent,
  setGlobalDispatcher,
} from "undici";
import { getUser } from "./user-service.js";

describe("getUser", () => {
  let mockAgent;
  let originalDispatcher;

  beforeEach(() => {
    originalDispatcher = getGlobalDispatcher();
    mockAgent = new MockAgent();
    // Prevent accidental real requests
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);
  });

  afterEach(async () => {
    await mockAgent.close();
    // Restore original dispatcher
    setGlobalDispatcher(originalDispatcher);
  });

  it("returns user data for valid id", async () => {
    const mockUser = {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
    };

    mockAgent
      .get("https://api.example.com")
      .intercept({
        path: "/users/1",
        method: "GET",
      })
      .reply(200, mockUser);

    const user = await getUser(1);

    assert.deepEqual(user, mockUser);
  });

  it("throws an error when user not found", async () => {
    mockAgent
      .get("https://api.example.com")
      .intercept({
        path: "/users/999",
        method: "GET",
      })
      .reply(404, { error: "Not found" });

    await assert.rejects(() => getUser(999), {
      message: "Failed to fetch user: 404",
    });
  });

  it("creates a new post", async () => {
    const newPost = {
      title: "Hello",
      body: "World",
      userId: 1,
    };
    const createdPost = { id: 42, ...newPost };

    mockAgent
      .get("https://api.example.com")
      .intercept({
        path: "/posts",
        method: "POST",
      })
      .reply(201, createdPost);

    const response = await fetch(
      "https://api.example.com/posts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      },
    );

    const data = await response.json();
    assert.equal(data.id, 42);
  });
});
