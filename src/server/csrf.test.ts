import { describe, expect, it } from "vitest";
import { allowsMutationRequest } from "./csrf";

const url = "https://mackay-refrigeration.withersco.workers.dev/crm/login";

function request(
  method: string,
  headers: Record<string, string> = {},
): Request {
  return new Request(url, { method, headers });
}

describe("allowsMutationRequest", () => {
  it("allows safe request methods", () => {
    expect(allowsMutationRequest(request("GET"))).toBe(true);
    expect(allowsMutationRequest(request("HEAD"))).toBe(true);
  });

  it("allows an exact same-origin mutation", () => {
    expect(
      allowsMutationRequest(
        request("POST", {
          Origin: "https://mackay-refrigeration.withersco.workers.dev",
        }),
      ),
    ).toBe(true);
  });

  it("allows an embedded browser's explicit same-origin fetch signal", () => {
    expect(
      allowsMutationRequest(
        request("POST", { "Sec-Fetch-Site": "same-origin" }),
      ),
    ).toBe(true);
  });

  it("allows a same-origin referrer when Origin is unavailable", () => {
    expect(
      allowsMutationRequest(
        request("POST", {
          Referer:
            "https://mackay-refrigeration.withersco.workers.dev/crm/login",
        }),
      ),
    ).toBe(true);
  });

  it("rejects a foreign Origin even if another signal says same-origin", () => {
    expect(
      allowsMutationRequest(
        request("POST", {
          Origin: "https://example.com",
          "Sec-Fetch-Site": "same-origin",
        }),
      ),
    ).toBe(false);
  });

  it("rejects null, same-site and provenance-free mutations", () => {
    expect(allowsMutationRequest(request("POST", { Origin: "null" }))).toBe(
      false,
    );
    expect(
      allowsMutationRequest(request("POST", { "Sec-Fetch-Site": "same-site" })),
    ).toBe(false);
    expect(allowsMutationRequest(request("POST"))).toBe(false);
  });
});
