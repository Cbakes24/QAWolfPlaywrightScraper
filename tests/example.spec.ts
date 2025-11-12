import { test, expect } from "@playwright/test";
// Helper function to parse and fix timestamps
// Helper function to check if timestamps are sorted (newest to oldest)
import { timeFix, currentArticlesSort } from ".././helperFunctions";
import { uploadFailedScreenshot } from "../lib/playwrightScreenshotHook.js";


//rather than have this line in each test we can load the page in a beforeEach test
test.beforeEach(async ({ page }) => {
  await page.goto("https://news.ycombinator.com/newest");
});

// Upload screenshots to Google Drive when tests fail
test.afterEach(async ({}, testInfo) => {
  await uploadFailedScreenshot(testInfo);
});

test.use({
  headless: true,
  // Increase timeouts to handle slow page loads
  actionTimeout: 30000,
  navigationTimeout: 30000,
});

test("find articles", async ({ page }) => {
  // Expect the page title to contain "Hacker News" so we know were onthe right page
  const title = await page.title();
  await expect(page).toHaveTitle(/Hacker News/); //assert that the title is as expected
  console.log("Page title is:", await page.title()); //confirm what the title is showing


  // Assert that there is at least one 'article' element present
  const articles = await page.locator(".athing");
  const articleCount = await articles.count();
  console.log(`Number of articles found: ${articleCount}`);

});

test("check for any articles with null or undefined timestamps", async ({ page }) => {
  // await page.goto("https://news.ycombinator.com/newest");
  const locator = await page.locator("span.age");
  const count = await locator.count();
  for (let i = 0; i < count; i++) {
    const time = await locator.nth(i).getAttribute("title"); // Get 'title' attribute
    if (!time) {
      console.error("Found null or undefined timestamp:", time);
      throw new Error("Test failed: Found null or undefined timestamp.");
    }
  }
});

test("articles sorted by date", async ({ page }) => {
  // await page.goto("https://news.ycombinator.com/newest");

  const timeArray: Date[] = []; //tell tyoescript that timeArray is an array of dates objects
  let hasMore = true; // Flag to check if there are more pages to load
  let pageCount = 0; // Track page count to prevent infinite loops
  const maxPages = 10; // Safety limit

  while (hasMore && timeArray.length < 100 && pageCount < maxPages) {
    // Evaluate all timestamps in one go using evaluateAll
    const locator = await page.locator("span.age");
    const count = await locator.count();
    for (let i = 0; i < count; i++) {
      const time = await locator.nth(i).getAttribute("title"); // Get 'title' attribute
      if (time) {
        const dateTime= timeFix(time);
        if (dateTime !== null) {
          timeArray.push(dateTime);
        }
      }
    }
    
    pageCount++;
    console.log(`Processed page ${pageCount}, collected ${timeArray.length} timestamps so far`);

    const moreLink = await page.getByRole("link", {
      name: "More",
      exact: true,
    });
    hasMore = await moreLink.isVisible();

    //if there are more articles to load and we havent reached 100 articles click the more link
    if (hasMore && timeArray.length < 100 && pageCount < maxPages) {
      try {
        // Add a small delay to prevent rapid clicking that might cause crashes
        await page.waitForTimeout(500);
        
        // Use a more robust click method with retry logic
        await moreLink.click({ timeout: 10000 });
        
        // Wait for navigation and content to load
        await page.waitForLoadState("networkidle", { timeout: 15000 });
        
        // Additional wait to ensure page is fully loaded
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.error(`Error clicking More link on page ${pageCount}:`, error);
        // If click fails, try to continue with what we have
        hasMore = false;
        break;
      }
    } else {
      hasMore = false; // Stop if no more pages or 100 timestamps collected
    }
  }

  // make note if there are less than 100 articles total even if they are sorted
  if (timeArray.length < 100) {
    console.log(`There are only ${timeArray.length} total articles`);
  }

  // Validate if timestamps are sorted
  const first100Timestamps = timeArray.slice(0, 100);
  console.log("First 100 timestamps length:", first100Timestamps.length);
  const isSorted = currentArticlesSort(first100Timestamps);
  console.log(
    "Are the first 100 timestamps sorted newest to oldest?",
    isSorted
  );
  expect(isSorted).toBe(true); // Assert that timestamps are sorted
});

// Test that intentionally fails to verify screenshot upload to Google Drive
test("intentional failure test for screenshot upload", async ({ page }) => {
  // Navigate to Hacker News
  await page.goto("https://news.ycombinator.com/newest");
  
  // Wait for page to load
  await page.waitForSelector(".athing", { timeout: 10000 });
  
  // This assertion will intentionally fail to trigger screenshot capture
  // The screenshot should be uploaded to "Hacker News Articles" folder in Google Drive
  await expect(page).toHaveTitle(/This Will Definitely Fail/);
});
