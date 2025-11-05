import { chromium } from "playwright";
import { timeFix, currentArticlesSort } from "./helperFunctions.js";
import { time, timeEnd } from "console";
import fs from "fs";


async function sortHackerNewsArticles() {
    console.time("total time");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://news.ycombinator.com/newest");
  
    let articlesArray = [];
    let pageNumber = 0;
  
    while (articlesArray.length < 100) {
      console.log(`Loading page ${pageNumber + 1}...`);
  
      await page.waitForSelector(".athing.submission");
  
      const pageArticles = await page.$$eval(".athing.submission", (elements) =>
        elements.map((element) => {
          const id = element.getAttribute("id");
          const title = element.querySelector(".titleline").innerText;
          const date = element.nextElementSibling.querySelector("span.age").getAttribute("title");
          const user = element.nextElementSibling.querySelector(".hnuser").innerText;
          const submitted = element.nextElementSibling.querySelector(".age").innerText;
          const url = element.querySelector("td.title a").getAttribute("href");
          return { id, title, date, user, submitted, url };
        })
      );
  
      pageArticles.forEach((article) => {
        article.date = timeFix(article.date);
      });
  
      const remainingSlots = 100 - articlesArray.length;
      articlesArray.push(...pageArticles.slice(0, remainingSlots));
  
      const moreLink = await page.$("a.morelink");
      if (!moreLink) {
        console.log("No more pages to load.");
        break;
      }
      await moreLink.click();
      await page.waitForLoadState("networkidle");
  
      pageNumber++;
    }
  
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `HackerNewsArticles_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(articlesArray, null, 2));
    const isSorted = articlesArray.length >= 100 && currentArticlesSort(articlesArray)
    console.log("Articles are sorted:", isSorted);
    console.log(`Collected ${articlesArray.length} articles.`);
    console.timeEnd("total time");
    await browser.close();
  }
  (async () => {
    await sortHackerNewsArticles();
  })();
  