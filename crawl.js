const { JSDOM } = require("jsdom");

const crawlPage = async (baseUrl, currentUrl, pages) => {
  const baseUrlObj = new URL(baseUrl);
  const currentUrlObj = new URL(currentUrl);

  // ignoring external links on website
  if (baseUrlObj.hostname !== currentUrlObj.hostname) {
    return pages;
  }
  /////////////////////////

  // keeping track & incrementing the no. of times a link has appeared
  const normalisedCurrentUrl = normalizeURL(currentUrl);
  if (pages[normalisedCurrentUrl] > 0) {
    pages[normalisedCurrentUrl]++;
    return pages;
  }
  /////////////////////////

  pages[normalisedCurrentUrl] = 1;

  console.log(`actively crawling ${currentUrl}`);
  try {
    const resp = await fetch(currentUrl);

    // checking for broken path on a valid url (404 error)
    if (resp.status > 399) {
      // console.log(
      //   `error in fetch with status code ${resp.status} on page ${currentUrl}`
      // );
      return pages;
    }
    ///////////////////////////

    // checking if fetched response is html or not
    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      // console.log(
      //   `non html content, content-type : ${contentType} on page : ${currentUrl}`
      // );
      return pages;
    }
    //////////////////////////////

    const htmlBody = await resp.text();
    const nextUrls = getURLsFromHTML(htmlBody, baseUrl);

    for (const nextUrl of nextUrls) {
      pages = await crawlPage(baseUrl, nextUrl, pages);
    }
  } catch (err) {
    // fetch failed - invalid url
    // console.log(`${err.message} on page ${currentUrl}`);
  }
  return pages;
};

function getURLsFromHTML(htmlBody, baseURL) {
  const urls = [];
  const dom = new JSDOM(htmlBody);
  const linkElements = dom.window.document.querySelectorAll("a");
  for (const linkElement of linkElements) {
    if (linkElement.href.slice(0, 1) === "/") {
      try {
        // relative
        const urlObj = new URL(`${baseURL}${linkElement.href}`);
        urls.push(urlObj.href);
      } catch (err) {
        // console.log(`relative url error : ${err.message}`);
      }
    } else {
      try {
        // absolute
        const urlObj = new URL(linkElement.href);
        urls.push(urlObj.href);
      } catch (err) {
        // console.log(`absolute url error : ${err.message}`);
      }
    }
  }
  return urls;
}

const normalizeURL = (urlString) => {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.host}${urlObj.pathname}`;
  if (hostPath.length > 0 && hostPath.slice(-1) === "/") {
    return hostPath.slice(0, -1);
  }
  return hostPath;
};

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage,
};
