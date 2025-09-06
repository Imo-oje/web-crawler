import { JSDOM } from "jsdom";

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

export const getHTML = async (url: string): Promise<string | undefined> => {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": "WebCrawler/1.0)",
      },
    });
  } catch (error) {
    throw new Error(
      `Network error: ${(error as Error).message} ${(error as Error).cause} ${
        (error as Error).name
      }`
    );
  }

  if (response.status >= 400) {
    console.log(`HTTP Error: ${response.status} ${response.statusText}`);
    return;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    console.log(`Content-Type is not HTML: ${contentType}`);
    return;
  }

  return await response.text();
};

export const crawlPage = async (
  baseURL: string,
  currentURL: string = baseURL,
  pages: Record<string, number> = {}
) => {
  const sameDomain = new URL(baseURL).hostname === new URL(currentURL).hostname;
  if (!sameDomain) {
    return pages;
  }

  console.log("sameDomain", sameDomain);
  const currentURLNormalized = normalizeURL(currentURL);

  if (pages[currentURLNormalized] > 0) {
    pages[currentURLNormalized]++;
    return pages;
  }

  pages[currentURLNormalized] = 1;

  console.log(`Crawling ${currentURL}...`);
  let webpage: string;
  try {
    console.log("currentUrl:", currentURL);
    webpage = (await getHTML(currentURL)) as string;
  } catch (error) {
    console.log(`${(error as Error).message}`);
    return pages;
  }
  console.log(`Finished crawling ${currentURL}`);

  const webpageURLS = getURLsFromHTML(webpage, baseURL);
  console.log(webpageURLS);
  for (const nextUrl of webpageURLS) {
    console.log("nextUrl: ", nextUrl);
    pages = await crawlPage(baseURL, nextUrl, pages);
  }

  return pages;
};
