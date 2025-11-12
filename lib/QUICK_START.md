# Quick Start: Google Drive Screenshot Upload

## Setup (One-Time)

1. **Get OAuth2 Credentials from Google Cloud Console**
   - Follow instructions in `GOOGLE_DRIVE_SETUP.md`
   - Download credentials and save as `credentials.json` in project root

2. **Authenticate**
   ```bash
   npm run auth:google
   ```
   Or directly:
   ```bash
   node lib/authGoogleDrive.js
   ```

3. **Run Tests**
   ```bash
   npm run playwright
   ```

## How It Works

✅ When a Playwright test fails, it will:
1. Automatically capture a screenshot
2. Upload it to Google Drive folder: **"Hacker News Screen Shots"**
3. Filename format: `failure_<test_name>_<timestamp>.png`

## Files Created

- `lib/googleDriveUpload.js` - Core upload functions
- `lib/authGoogleDrive.js` - OAuth2 authentication helper
- `lib/playwrightScreenshotHook.js` - Test hook integration
- `GOOGLE_DRIVE_SETUP.md` - Detailed setup guide
- `credentials.json.example` - Template for credentials

## Files Modified

- `playwright.config.ts` - Added screenshot on failure config
- `tests/example.spec.ts` - Added `afterEach` hook for upload
- `.gitignore` - Added credentials.json and token.json
- `package.json` - Added `auth:google` script

## Troubleshooting

**Credentials not found?**
- Make sure `credentials.json` is in project root
- See `GOOGLE_DRIVE_SETUP.md` for setup instructions

**Token expired?**
- Run `npm run auth:google` again to refresh

**Upload not working?**
- Check console logs for error messages
- Verify Google Drive API is enabled
- Screenshots still saved locally even if upload fails
