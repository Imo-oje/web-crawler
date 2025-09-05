import { describe, it, expect } from "vitest";
import { normalizeURL } from "../crawl"; // adjust import path

describe("normalizeURL", () => {
  it("removes protocol (https)", () => {
    expect(normalizeURL("https://google.com")).toBe("google.com");
  });

  it("removes protocol (http)", () => {
    expect(normalizeURL("http://google.com")).toBe("google.com");
  });

  it("removes trailing slash", () => {
    expect(normalizeURL("https://google.com/")).toBe("google.com");
  });

  it("keeps path if no trailing slash", () => {
    expect(normalizeURL("https://google.com")).toBe("google.com");
  });

  it("works without any path", () => {
    expect(normalizeURL("https://google.com/")).toBe("google.com");
  });

  it("works without path or trailing slash", () => {
    expect(normalizeURL("https://google.com")).toBe("google.com");
  });

  // Error handling
  it("throws an error for invalid URL input", () => {
    expect(() => normalizeURL("not-a-valid-url")).toThrow();
  });

  it("throws a specific error message", () => {
    expect(() => normalizeURL("invalidurl")).toThrow("Invalid URL");
  });
});
