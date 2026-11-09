import { describe, expect, it } from "vitest";

import { hasJsonContentType, isSameOrigin } from "@/lib/http";

function request(url: string, headers: Record<string, string>): Request {
  return new Request(url, { headers });
}

describe("request guards", () => {
  it("accepts a missing origin and a matching origin", () => {
    expect(isSameOrigin(request("https://rill.agent/api/waitlist", {}))).toBe(true);
    expect(
      isSameOrigin(
        request("https://rill.agent/api/waitlist", {
          origin: "https://rill.agent",
          host: "rill.agent",
        }),
      ),
    ).toBe(true);
  });

  it("rejects a cross-origin browser request", () => {
    expect(
      isSameOrigin(
        request("https://rill.agent/api/waitlist", {
          origin: "https://evil.example",
          host: "rill.agent",
        }),
      ),
    ).toBe(false);
  });

  it("rejects a malformed origin", () => {
    expect(
      isSameOrigin(
        request("https://rill.agent/api/waitlist", {
          origin: "not a url",
          host: "rill.agent",
        }),
      ),
    ).toBe(false);
  });

  it("requires a JSON content type", () => {
    expect(
      hasJsonContentType(
        request("https://rill.agent/api/waitlist", {
          "content-type": "application/json; charset=utf-8",
        }),
      ),
    ).toBe(true);
    expect(
      hasJsonContentType(
        request("https://rill.agent/api/waitlist", {
          "content-type": "text/plain",
        }),
      ),
    ).toBe(false);
  });
});
