import { JSDOM } from "jsdom";
import { LimitFunction } from "p-limit";

export const normalizeURL = (url: string) => {
  try {
    const parsed = new URL(url);
    let normalized = parsed.host + parsed.pathname;
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch (error) {
    throw new Error("Invalid URL");
  }
};

export const getURLsFromHTML = (html: string, baseURL: string): string[] => {
  const dom = new JSDOM(html);
  let urls: string[] = [];
  dom.window.document.querySelectorAll("a").forEach((e) => {
    // ignore invalid urls
    let href = e.getAttribute("href");
    if (!href) return;

    try {
      href = new URL(href, baseURL).toString();
      // only allow http(s) url
      if (!href.startsWith("http://") && !href.startsWith("https://")) return;

      urls.push(href);
    } catch (error) {}
  });

  return urls;
};

class ConcurrentCrawler {
  baseURL: string;
  limit: LimitFunction;
  pages: Record<string, number> = {};

  constructor(
    baseURL: string,
    limit: LimitFunction,
    pages: Record<string, number> = {}
  ) {
    this.baseURL = baseURL;
    this.limit = limit;
    this.pages = pages;
  }

  private addPageVisit(url: string): boolean {
    // return false if it's NOT the first visit
    if (typeof this.pages[url] === "number") {
      this.pages[url] += 1;
      return false;
    }
    this.pages[url] = 1;
    return true;
  }

  private async getHTML(currentURL: string): Promise<string | undefined> {
    return this.limit(async () => {
      let response: Response;
      try {
        response = await fetch(currentURL, {
          headers: { "User-Agent": "WebCrawler/1.0" },
        });
      } catch (err) {
        console.log(`Network error: ${(err as Error).message}`);
        return;
      }

      if (!response.ok) {
        console.log(`HTTP Error: ${response.status} ${response.statusText}`);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("text/html")) {
        console.log(`Content-Type is not HTML: ${contentType}`);
        return;
      }

      return response.text();
    });
  }

  private async crawlPage(currentURL: string): Promise<void> {
    // make URL creation resilient to relative links
    let resolved: URL;
    try {
      resolved = new URL(currentURL, this.baseURL);
    } catch (err) {
      console.log(`Invalid URL: ${currentURL}`);
      return;
    }

    if (new URL(this.baseURL).hostname !== resolved.hostname) return;

    const normalizedURL = normalizeURL(resolved.toString());

    if (!this.addPageVisit(normalizedURL)) return;

    console.log(`Crawling ${resolved.toString()}...`);
    const webpageHTML = await this.getHTML(resolved.toString());
    if (!webpageHTML) {
      console.log(`No HTML for ${resolved.toString()}`);
      return;
    }
    console.log(`Finished crawling ${resolved.toString()}`);

    const urls = getURLsFromHTML(webpageHTML, this.baseURL);

    // parallelize children
    const promises = urls.map((nextUrl) => this.crawlPage(nextUrl));
    await Promise.all(promises);
  }

  public async crawl() {
    await this.crawlPage(this.baseURL);
    return this.pages;
  }
}

export const crawlSiteAsync = async (baseURL: string, limit: LimitFunction) => {
  const crawler = new ConcurrentCrawler(baseURL, limit);
  return crawler.crawl();
};
