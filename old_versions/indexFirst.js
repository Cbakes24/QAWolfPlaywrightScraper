// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
// added a timing function to see how long each test is taking to run
const { time, timeEnd } = require("console");
const { chromium } = require("playwright");
const { timeFix, currentArticlesSort } = require("../helperFunctions");
const fs = require("fs");

async function sortHackerNewsArticles() {
  console.time("total time");
  // ***use an env variable to toggle headless mode so it doesnt take so long to run
  //This starts a Chromium browser and opens a new page in non-headless mode (a visible browser window)
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // this will take you to the newest Hcker news website
  await page.goto("https://news.ycombinator.com/newest");

  // Array to store all timestamps of our articles to later on check if they are sorted

  // page.on("load", (data) => {
  //   console.log("page has loaded data content");
  // });



  // confriming articles have loaded
  await page
    .waitForSelector(".athing.submission")
    .then(() => console.log("article info found"))
    .catch(() => console.log("article info not found"));

  //****check ids to ensure full sorting incase they have the same timestamp
  const timeArray = [];
  let hasMore = true; // Flag to check if there are more pages to load
  let pageCount = 1;


  while (hasMore && timeArray.length < 100) {
    console.log(`Current timeArray length: ${timeArray.length}`);
    console.log(`Processing page ${pageCount}...`);
    pageCount++;
    // Locate all timestamps on the current page
    const articlesTimeArray = await page.locator("span.age"); //inside any element that has span with the class of age we grab the title which is the date in this case
    const count = await articlesTimeArray.count();
    console.log(`Found ${count} timestamps.`);

    for (let i = 0; i < count; i++) {
      const time = await articlesTimeArray.nth(i).getAttribute("title");
      //use the timefix helper function to corretcly input the date info so it is compatible wwith javascript
      const dateTime = timeFix(time);
      timeArray.push(dateTime);
    }

    // Check if we have reached 100 articles and if so are they sorted
    if (timeArray.length >= 100) {
      // Slice the first 100 timestamps for sorting check
      const first100Timestamps = timeArray.slice(0, 100);
      console.log(
        "There are total of",
        first100Timestamps.length,
        "timestamps."
      );
      //use the helper function to check if the articles are sorted
      const isSorted = currentArticlesSort(first100Timestamps);
      //Log if the arcticles are sorted
      console.log(
        "Are the first 100 timestamps sorted newest to oldest?",
        isSorted
      );
   
      if (!isSorted) {
        console.error("Timestamps are not sorted correctly!");
        break;
      }
    }
    //If we haven't hit 100 articles then check if there is a "More" link to navigate to the next page

    // **** add a warning incase they remove the More button
    //**** precompute the number of pages we need to load and not rely on the more button
    const moreLink = await page.getByRole("link", {
      name: "More",
      exact: true,
    });

    hasMore = await moreLink.isVisible();

    if (hasMore && timeArray.length < 100) {
      console.log("Clicking the 'More' link to load more articles...");
      //click the more link to load the next 30 articles
      await moreLink.click();
      await page.waitForLoadState("networkidle"); // Wait for the next page to load
    } else {
      console.log("No more pages or 100 timestamps collected.");
      hasMore = false;
    }
  }
  console.timeEnd("total time")
  await browser.close();
}

(async () => {
  await sortHackerNewsArticles();
})();
