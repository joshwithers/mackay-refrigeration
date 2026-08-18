import { describe, expect, it } from "vitest";
import {
  allowsMutationRequest,
  createCsrfCookieValue,
  isValidCsrfCookieValue,
  pathNeedsCsrfCookie,
} from "./csrf";

const url = "https://mackay-refrigeration.withersco.workers.dev/crm/login";

function request(
  method: string,
  headers: Record<string, string> = {},
): Request {
  return new Request(url, { method, headers });
}

describe("allowsMutationRequest", () => {
  const csrfCookie = "4f777d69-a9f6-48de-bb59-970d388a2cf1";

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

  it("rejects a foreign Origin even if other signals say same-origin", () => {
    expect(
      allowsMutationRequest(
        request("POST", {
          Origin: "https://example.com",
          "Sec-Fetch-Site": "same-origin",
        }),
        csrfCookie,
      ),
    ).toBe(false);
  });

  it("allows null or missing provenance with the strict host cookie", () => {
    expect(
      allowsMutationRequest(request("POST", { Origin: "null" }), csrfCookie),
    ).toBe(true);
    expect(allowsMutationRequest(request("POST"), csrfCookie)).toBe(true);
  });

  it("rejects same-site, null and provenance-free mutations without the cookie", () => {
    expect(allowsMutationRequest(request("POST", { Origin: "null" }))).toBe(
      false,
    );
    expect(
      allowsMutationRequest(request("POST", { "Sec-Fetch-Site": "same-site" })),
    ).toBe(false);
    expect(allowsMutationRequest(request("POST"))).toBe(false);
    expect(allowsMutationRequest(request("POST"), "not-a-server-marker")).toBe(
      false,
    );
  });

  it("creates valid random marker values", () => {
    const first = createCsrfCookieValue();
    const second = createCsrfCookieValue();
    expect(isValidCsrfCookieValue(first)).toBe(true);
    expect(isValidCsrfCookieValue(second)).toBe(true);
    expect(first).not.toBe(second);
  });

  it("scopes the marker to CRM and public form pages", () => {
    expect(pathNeedsCsrfCookie("/crm/login")).toBe(true);
    expect(pathNeedsCsrfCookie("/crm")).toBe(true);
    expect(pathNeedsCsrfCookie("/contact")).toBe(true);
    expect(pathNeedsCsrfCookie("/hire-contract")).toBe(true);
    expect(pathNeedsCsrfCookie("/service-supply")).toBe(true);
    expect(pathNeedsCsrfCookie("/forms/demo-link")).toBe(true);
    expect(pathNeedsCsrfCookie("/")).toBe(false);
  });
});
