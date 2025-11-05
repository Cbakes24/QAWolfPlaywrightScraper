import { uploadReportScreenshot } from './uploadReportScreenshot.js';

/**
 * Custom Playwright reporter that uploads screenshot after tests complete
 * Playwright reporters are functions that receive reporter options
 */
export default function GoogleDriveReporter(options) {
  return {
    async onEnd(result) {
      try {
        console.log('\n📤 Uploading report screenshot to Google Drive...');
        await uploadReportScreenshot();
      } catch (error) {
        console.error('Failed to upload screenshot:', error.message);
        // Don't fail the test run if upload fails
      }
    }
  };
}
