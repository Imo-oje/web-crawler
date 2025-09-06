import * as process from "node:process";
import pLimit from "p-limit";
import { crawlSiteAsync } from "./concurrent-crawler";

async function main() {
  if (process.argv.length < 3 || process.argv.length > 3) {
    console.log("Usage: npm run start <BASE_URL>");
    process.exit(1);
  }
  const baseURL = process.argv[2];

  console.log(`Starting to crawl page: ${baseURL} ...`);
  //const pages = await crawlPage(basURL);
  const limit = pLimit(30);

  const pages = await crawlSiteAsync(baseURL, limit);

  console.log(pages);
  process.exit(0);
}

main();
