import { describe, it, expect } from "vitest";
import { getURLsFromHTML, normalizeURL } from "../crawl"; // adjust import path

describe("normalizeURL", () => {
  it("removes protocol (https)", () => {
    expect(normalizeURL("https://google.com/path")).toBe("google.com/path");
  });

  it("removes protocol (http)", () => {
    expect(normalizeURL("http://google.com/path")).toBe("google.com/path");
  });

  it("removes trailing slash", () => {
    expect(normalizeURL("https://google.com/path/")).toBe("google.com/path");
  });

  it("keeps path if no trailing slash", () => {
    expect(normalizeURL("https://google.com/path")).toBe("google.com/path");
  });

  it("works without any path", () => {
    expect(normalizeURL("https://google.com/path/")).toBe("google.com/path");
  });

  it("works without path or trailing slash", () => {
    expect(normalizeURL("https://google.com/path")).toBe("google.com/path");
  });

  // Error handling
  it("throws an error for invalid URL input", () => {
    expect(() => normalizeURL("not-a-valid-url")).toThrow();
  });

  it("throws a specific error message", () => {
    expect(() => normalizeURL("invalidurl")).toThrow("Invalid URL");
  });
});

describe("getURLsFromHTML", () => {
  it("converts relative URLs to absolute URLs.", () => {
    const html = `
     <html>
        <body>
          <a href="/about">One</a>
        </body>
      </html>
    `;
    const urls = getURLsFromHTML(html, "https://example.com");
    expect(urls).toContain("https://example.com/about");
  });

  it("find all the anchor elements in a body of HTML", () => {
    const html = `
     <html>
        <body>
          <a href="/one">One</a>
          <a href="/two">Two</a>
          <a href="https://external.com">External</a>
        </body>
      </html>
    `;
    const urls = getURLsFromHTML(html, "https://example.com");
    expect(urls).toEqual([
      "https://example.com/one",
      "https://example.com/two",
      "https://external.com/",
    ]);
  });

  it("returns absolute URLs", () => {
    const html = `
      <html>
        <body>
          <a href="https://other.com">Other</a>
        </body>
      </html>
    `;
    const baseURL = "https://example.com";
    const urls = getURLsFromHTML(html, baseURL);

    expect(urls).toContain("https://other.com/");
  });

  it("ignores invalid href attributes", () => {
    const html = `
      <html>
        <body>
          <a>No href</a>
          <a href="">Empty</a>
          <a href="javascript:void(0)">Bad</a>
        </body>
      </html>
    `;
    const baseURL = "https://example.com";
    const urls = getURLsFromHTML(html, baseURL);

    expect(urls).toEqual([]);
  });
});
