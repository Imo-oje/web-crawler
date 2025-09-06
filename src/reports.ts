export const printReport = (
  baseUrl: string,
  pageObject: Record<string, number>
) => {
  console.log("=============================");
  console.log(`REPORT for ${baseUrl}`);
  console.log("=============================");

  const sortedPage = Object.entries(pageObject).sort((a, b) => b[1] - a[1]);
  for (const [url, count] of sortedPage) {
    console.log(`Found ${count} internal links to ${url}`);
  }
};
