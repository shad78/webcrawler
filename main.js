const { crawlPage } = require("./crawl");

async function main() {
  if (process.argv.length < 3) {
    console.log("no website provided.");
    process.exit();
  } else if (process.argv.length > 3) {
    console.log("too many command line arguments.");
    process.exit();
  } else {
    const baseUrl = process.argv[2];
    console.log(`starting crawl of ${baseUrl}`);
    const pages = await crawlPage(baseUrl, baseUrl, {});
    console.log(pages);
  }
}

main();
