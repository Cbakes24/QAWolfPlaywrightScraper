# Google Drive Screenshot Upload - Quick Start

## What Was Set Up

✅ **Automatic screenshot upload** of Playwright test reports to Google Drive
✅ **OAuth2 authentication** using Google Drive API
✅ **Automatic folder creation** - "Hacker News Screen Shots" folder in your Drive
✅ **Custom Playwright reporter** - Runs automatically after tests complete

## Files Created

- `uploadToDrive.js` - Google Drive API integration
- `screenshotReport.js` - Takes screenshot of HTML report
- `uploadReportScreenshot.js` - Main script that combines both
- `setupGoogleDrive.js` - OAuth2 authentication helper
- `googleDriveReporter.js` - Custom Playwright reporter
- `GOOGLE_DRIVE_SETUP.md` - Detailed setup instructions

## Quick Setup (5 minutes)

1. **Get Google OAuth credentials:**
   - Follow the detailed instructions in `GOOGLE_DRIVE_SETUP.md`
   - Download `credentials.json` and place it in project root

2. **Authenticate:**
   ```bash
   node setupGoogleDrive.js
   ```
   - Copy the authorization URL and open in browser
   - Copy the code from redirect URL
   - Run: `node setupGoogleDrive.js <code>`

3. **Test it:**
   ```bash
   npm run playwright
   ```
   Screenshot will automatically upload to Google Drive! 🎉

## Usage

### Automatic (Recommended)
```bash
npm run playwright
```
Screenshots upload automatically after tests complete.

### Manual Upload
```bash
npm run playwright:upload
```
Runs tests, then uploads screenshot.

### Screenshot Only
```bash
node uploadReportScreenshot.js
```
Takes screenshot and uploads (requires existing report).

## Configuration

- **Folder Name**: "Hacker News Screen Shots" (configurable in `uploadToDrive.js`)
- **Screenshot Size**: 1920x1080 (configurable in `screenshotReport.js`)
- **Report Location**: `playwright-report/index.html`

## Troubleshooting

See `GOOGLE_DRIVE_SETUP.md` for detailed troubleshooting guide.

**Common Issues:**
- ❌ "credentials.json not found" → Download OAuth credentials
- ❌ "No token found" → Run `node setupGoogleDrive.js`
- ❌ Token expired → Delete `token.json` and re-authenticate

## Security

⚠️ **Never commit these files:**
- `credentials.json` (OAuth credentials)
- `token.json` (Access token)

They're already in `.gitignore` ✅
