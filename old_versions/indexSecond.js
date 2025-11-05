// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
//adding helper functions from a seperate file to test the date and sort the timestamps
const { timeFix, currentArticlesSort } = require("../helperFunctions");
// added a timing function to see how long each test is taking to run
const { time, timeEnd } = require("console");
// added a fs module to write the data to a json file
const fs = require("fs");



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
  await page.waitForSelector(".athing.submission")
    .then(() => console.log("article info found"))
    .catch(() => console.log("article info not found"));

  //****check ids to ensure full sorting incase they have the same timestamp
  // ******** Gather Article Information and create a seperate json file to store data ********

//create an array to store the articles and the data to later sort
  let articlesArray = [];
  //create a page number to track the pages
  let pageNumber = 0;
  //create a flag to check if there are more pages to load
  let hasMore = true;
  //create a count to track the articles and confirm 100 articles have been loaded
  let count = 1; 
  
  
  while (hasMore && articlesArray.length < 100) {
    console.log(`Loading page ${pageNumber + 1}...`);
    console.log(`Current timeArray length: ${articlesArray.length}`);
    // Load the current page
    //check the more link

    //create a variable to store the articles on the page
    const pageArticles = await page.$$eval(".athing.submission", (elements) => {
      return elements.slice(0, 100).map((element, index) => {
        const id = element.getAttribute("id");
        const title = element.querySelector(".titleline").innerText;
        const date = element.nextElementSibling.querySelector("span.age").getAttribute("title");
        const user = element.nextElementSibling.querySelector(".hnuser").innerText;
        const submitted = element.nextElementSibling.querySelector(".age").innerText;
        const url = element.querySelector(".titleline").innerHTML;
  
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
      console.log("No more pages to load.");
      hasMore = false;
      break;
    }
    //if there is a "More" link then click it to load the next page since we are in our while loop we havent hit 100 articles
    await moreLink.click();
    await page.waitForLoadState("networkidle"); // Wait for the next page to load fully


    // Check if we have reached 100 articles or if there are no more pages and if so then check if the articles are sorted
    if (!hasMore || articlesArray.length >= 100) {
      // Slice the first 100 articles for sorting check
      const first100Articles = articlesArray.slice(0, 100);
        //write the first 100 articles to a json file
      fs.writeFileSync("articles.json", JSON.stringify(first100Articles, null, 2));
      //need to isolate the timestamps to sort through
      const first100Timestamps = first100Articles.map(
        (article) => article.date
      );

      console.log("There are total of", first100Articles.length, "articles.");
      // Check if the articles are sorted using the helper function we imported
      const isSorted = currentArticlesSort(first100Timestamps);
      //log if the articles are sorted
      console.log(
        "Are the first 100 Articles sorted newest to oldest?",
        isSorted
      );
     
      if (!isSorted) {
        console.error("Timestamps are not sorted correctly!");
        break;
      }
    }

    console.log(`Total articles collected so far: ${articlesArray.length}`);

    pageNumber++;
  }
  //log the total time it took to run the function
  console.timeEnd("total time");
  //close the browser
  await browser.close();
}
(async () => {
  await sortHackerNewsArticles();
})();
