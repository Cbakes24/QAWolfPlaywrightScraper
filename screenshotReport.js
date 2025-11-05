import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Take a screenshot of the Playwright HTML report
 */
async function screenshotReport() {
  const reportPath = path.join(__dirname, 'playwright-report', 'index.html');
  const screenshotPath = path.join(__dirname, 'playwright-report-screenshot.png');

  // Check if report exists
  if (!fs.existsSync(reportPath)) {
    throw new Error(
      `Playwright report not found at ${reportPath}. Please run 'npm run playwright' first.`
    );
  }

  // Convert to file:// URL for local file access
  const reportUrl = `file://${reportPath}`;

  console.log('Taking screenshot of Playwright report...');
  console.log(`Report path: ${reportPath}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Navigate to the report
    await page.goto(reportUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(2000);

    // Take full page screenshot
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png',
    });

    console.log(`✅ Screenshot saved to: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.error('Error taking screenshot:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

export { screenshotReport };

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  screenshotReport()
    .then((path) => {
      console.log('Screenshot complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Screenshot failed:', error.message);
      process.exit(1);
    });
}
