import * as process from "node:process";
import { crawlPage, getHTML, getURLsFromHTML, normalizeURL } from "./crawl";

async function main() {
  if (process.argv.length < 3 || process.argv.length > 3) {
    console.log("Usage: npm run start <BASE_URL>");
    process.exit(1);
  }
  const basURL = process.argv[2];

  console.log(`Starting to crawl page: ${basURL} ...`);
  const pages = await crawlPage(basURL);

  console.log(pages);
  process.exit(0);
}

main();
