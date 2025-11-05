import { screenshotReport } from './screenshotReport.js';
import { uploadScreenshot } from './uploadToDrive.js';

/**
 * Main script: Take screenshot of Playwright report and upload to Google Drive
 */
async function uploadReportScreenshot() {
  try {
    console.log('📸 Step 1: Taking screenshot of Playwright report...\n');
    const screenshotPath = await screenshotReport();

    console.log('\n☁️  Step 2: Uploading to Google Drive...\n');
    await uploadScreenshot(screenshotPath);

    console.log('\n✅ Complete! Screenshot uploaded to Google Drive.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

uploadReportScreenshot();
