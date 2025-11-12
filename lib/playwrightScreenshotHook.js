import { uploadScreenshotOnFailure } from './googleDriveUpload.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Playwright global setup hook for screenshot upload on failure
 * This is called after each test failure
 */
export async function uploadFailedScreenshot(testInfo) {
  if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
    try {
      // Playwright automatically saves screenshots on failure
      // The screenshot path is in testInfo.attachments
      const screenshotAttachment = testInfo.attachments.find(
        attachment => attachment.name === 'screenshot' || attachment.path?.endsWith('.png')
      );

      if (screenshotAttachment && screenshotAttachment.path) {
        const screenshotPath = screenshotAttachment.path;
        
        // Verify file exists
        if (fs.existsSync(screenshotPath)) {
          console.log(`\n📸 Test failed! Uploading screenshot to Google Drive...`);
          console.log(`   Test: ${testInfo.title}`);
          console.log(`   Screenshot: ${screenshotPath}`);
          
          await uploadScreenshotOnFailure(screenshotPath, testInfo.title);
        } else {
          console.warn(`⚠️  Screenshot file not found: ${screenshotPath}`);
        }
      } else {
        console.warn('⚠️  No screenshot attachment found for failed test');
      }
    } catch (error) {
      console.error('❌ Error in screenshot upload hook:', error.message);
      // Don't throw - we don't want to prevent test execution
    }
  }
}
