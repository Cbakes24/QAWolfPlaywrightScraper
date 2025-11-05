//***** THIS FILE USES WINTSON LOGGER TO LOG MESSAGES TO THE CONSOLE AND A SCAPER LOG FILE **********/ 


import { chromium } from "playwright";
//adding helper functions from a seperate file to test the date and sort the timestamps
import {
  timeFix,
  currentArticlesSort,
} from "./helperFunctions.js";
// added a timing function to see how long each test is taking to run
import { time, timeEnd } from "console";
// added a fs module to write the data to a json file
import fs from "fs";
//adding winston to have a better logger system for console messages
import winston from "winston";

const logger = winston.createLogger({
  level: "info", // Adjust log level as needed: debug, info, warn, error
  transports: [
    new winston.transports.Console(), // Logs to console
    new winston.transports.File({ filename: "scraper.log" }), // Logs to a file
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
});








async function sortHackerNewsArticles() {
  //start tracking the time it takes to run the function E2E
  console.time("total time");
  //This starts a Chromium browser and opens a new page in non-headless mode (a visible browser window)
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // Debugging: Check if of articles found on the page
  await page
    .waitForSelector(".athing.submission")
    .then(() => console.log("article info found"))
    .catch(() => console.log("article info not found"));

  //create an array to store the articles, can use this later to make a json file with the data
  let articlesArray = [];
  //create a page number to track the pages
  let pageNumber = 0;
  //create a flag to check if there are more pages to load
  let hasMore = true;
  //create a count to track the articles and confirm 100 articles have been loaded
  let count = 1;

  while (hasMore && articlesArray.length < 100) {
    logger.info(`Loading page ${pageNumber + 1}. Current total articles: ${articlesArray.length}.`);
/**
 * Create an array of article objects from the current page (up to 30 articles per page).
 * The data for each article is extracted using elements identified through Chrome DevTools.
 */
    const pageArticles = await page.$$eval(".athing.submission", (elements) => {
      return elements.slice(0, 100).map((element, index) => {
        const id = element.getAttribute("id"); // id: The unique identifier of the article.
        const title = element.querySelector(".titleline").innerText; //title: The title of the article.     
        const date = element.nextElementSibling.querySelector("span.age").getAttribute("title"); //date: The exact timestamp when the article was submitted.
        const user = element.nextElementSibling.querySelector(".hnuser").innerText; //user: The username of the person who submitted the article.
        const submitted = element.nextElementSibling.querySelector(".age").innerText; //submitted: The relative time since submission (e.g., "2 hours ago").
        const url = element.querySelector("td.title a").getAttribute("href"); //url: The URL of the article.
    
        // returning the article object to use for json file later
        return {
          id: id,
          title: title,
          date: date,
          user: user,
          submitted: submitted,
          url: url,
        };
      });
    });

    //convert the date to a javascript date object and remove the Unix time stamp by using out helper function timeFix 
    pageArticles.forEach((article) => {
      // console.log("Raw date before timeFix:", article.date);
      article.date = timeFix(article.date);
    });
 
    logger.info(`Scraped ${pageArticles.length} articles on page ${pageNumber + 1}.`);
    if (articlesArray.length >= 100) {
        logger.info(
          `Collected ${articlesArray.length} articles. Writing to JSON file.`
        );
      }
    
    // If we're on the final page that would exceed 100 articles, slice it to only include the remaining needed articles
    if (articlesArray.length + pageArticles.length > 100) {
      const remainingArticles = 100 - articlesArray.length;
      logger.warn(`Trimming final page to ${remainingArticles} articles.`);
      pageArticles.splice(remainingArticles); // Keep only the remaining articles needed
    }

    const areSorted = currentArticlesSort(pageArticles, timeFix);
    /*sort through current page articles and check if any are not sorted, sorting here allows us to break early
    if there is an issue which can save memory, make debugging easier
    We could alternativly just gather the first 100 articles and then sort after which is a more cleaner more simple approach
    that can potentially be faster by sorting all the articles at once rather than in chucnks.. see noNotesIndex.js for sortin all 100 articles*/ 
    if (areSorted) {
      console.log(
        "All currenttimestamps are sorted correctly from newest to oldest ok to add to json file and move to next page."
      );
    } else {
      logger.error(`Unsorted articles detected on page ${pageNumber + 1} after collecting ${articlesArray.length} articles.`);
      break;
    }

    // Add a global count to each article
    pageArticles.forEach((article) => {
      article.count = count++; // Assign the current value of count and increment it
    });

    //add the current page articles to our arcticle array
    articlesArray = articlesArray.concat(pageArticles);

    //If we haven't hit 100 articles then check if there is a "More" link to navigate to the next page
    const moreLink = await page.$("a.morelink");
    //if there is no "More" link then there are no more articles to load so you'll sort through the articles you have even if there are not 100
    if (!moreLink) {
    logger.warn("No more pages to load.");
      hasMore = false;
      break;
    }
    //if there is a "More" link then click it to load the next page since we are in our while loop we havent hit 100 articles
    await moreLink.click();
    await page.waitForLoadState("networkidle"); // Wait for the next page to load fully

    // Check if we have reached 100 articles or if there are no more pages and if so then check if the articles are sorted
    if (!hasMore || articlesArray.length >= 100) {
      // Slice the first 100 articles for sorting check, should already be at 100 articles but this can be a saftey gaurd
      const first100Articles = articlesArray.slice(0, 100);
      //put the first 100 articles objects to a json file
      logger.info(`Collected ${ first100Articles.length} articles. Writing to JSON file.`);
      fs.writeFileSync("HackerNewsArticles.json", JSON.stringify(articlesArray.slice(0, 100), null, 2));
      logger.info("JSON file saved: HackerNewsArticles.json");
      // Check if the articles are sorted using the helper function we imported
      const isSorted = true;
      //log if the articles are sorted
      logger.info(`Are the first 100 Articles sorted newest to oldest? ${isSorted}`);
    }

    console.log(`Total articles collected so far: ${articlesArray.length}`);

    pageNumber++;
  }
  //log the total time it took to run the function
  console.timeEnd("total time");
  logger.info("Scraping completed. Closing browser.");
  await browser.close();
}
(async () => {
  await sortHackerNewsArticles();
})();
