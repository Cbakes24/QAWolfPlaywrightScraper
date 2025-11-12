# Google Drive Screenshot Upload Setup Guide

This guide will help you set up OAuth2 authentication to automatically upload test failure screenshots to Google Drive.

## Prerequisites

- Google account
- Node.js installed
- `googleapis` package (already installed in this project)

## Step 1: Create Google Cloud Project & OAuth2 Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name it (e.g., "Playwright Screenshots")
   - Click "Create"

3. **Enable Google Drive API**
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click on it and click "Enable"

4. **Create OAuth2 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: "External" (or "Internal" if using Google Workspace)
     - App name: "Playwright Screenshots"
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
     - Scopes: Click "Add or Remove Scopes" → Search for "Google Drive API" → Select `.../auth/drive.file` → Click "Update" → "Save and Continue"
     - Test users: Add your email → "Save and Continue"
   
   - Back to OAuth client creation:
     - Application type: "Desktop app" (or "Web application")
     - Name: "Playwright Screenshot Uploader"
     - Authorized redirect URIs: `http://localhost` (for web) or leave blank for desktop
     - Click "Create"

5. **Download Credentials**
   - Click the download icon (⬇️) next to your newly created OAuth client
   - Save the JSON file as `credentials.json` in the project root directory
   - **Important**: Keep this file secure and never commit it to version control!

## Step 2: Initial Authentication

1. **Run the authentication script:**
   ```bash
   node lib/authGoogleDrive.js
   ```

2. **Follow the prompts:**
   - A URL will be displayed in the terminal
   - Copy and paste it into your browser
   - Sign in with your Google account
   - Click "Allow" to grant permissions
   - You'll be redirected to a URL with a code parameter
   - Copy the entire authorization code from the URL
   - Paste it back into the terminal when prompted

3. **Token saved:**
   - A `token.json` file will be created with your access tokens
   - This file stores your authentication and will be reused automatically

## Step 3: Verify Setup

1. **Check that files exist:**
   - `credentials.json` - OAuth2 credentials from Google Cloud Console
   - `token.json` - Authentication tokens (created after first auth)

2. **Run a test to verify:**
   ```bash
   npm run playwright
   ```
   - If a test fails, you should see a message about uploading to Google Drive
   - Check your Google Drive for a folder called "Hacker News Screen Shots"

## Troubleshooting

### "credentials.json not found"
- Make sure you downloaded the OAuth2 credentials from Google Cloud Console
- Place the file in the project root directory (same level as `package.json`)

### "token.json not found"
- Run `node lib/authGoogleDrive.js` to authenticate
- Make sure you complete the OAuth flow and copy the authorization code

### "Invalid credentials" or "Token expired"
- Delete `token.json` and run `node lib/authGoogleDrive.js` again
- Tokens may expire; you'll need to re-authenticate periodically

### Screenshot not uploading
- Check that you have internet connection
- Verify Google Drive API is enabled in your Google Cloud project
- Check console logs for specific error messages
- Screenshots will still be saved locally even if upload fails

### Permission errors
- Make sure you granted the correct scopes (`drive.file`)
- Check that your Google account has access to Google Drive
- Verify the OAuth consent screen is configured correctly

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit credentials files:**
   - `credentials.json` should be in `.gitignore` ✅ (already added)
   - `token.json` should be in `.gitignore` ✅ (already added)

2. **Keep credentials secure:**
   - Don't share `credentials.json` or `token.json` files
   - Use environment variables in production/CI environments

3. **Rotate credentials if compromised:**
   - Delete old credentials in Google Cloud Console
   - Create new ones and update `credentials.json`

## File Structure

```
project-root/
├── credentials.json          # OAuth2 credentials (from Google Cloud Console)
├── token.json                # Auth tokens (generated after first auth)
├── lib/
│   ├── googleDriveUpload.js  # Drive upload functions
│   ├── authGoogleDrive.js    # OAuth2 authentication
│   └── playwrightScreenshotHook.js  # Test hook integration
└── tests/
    └── example.spec.ts       # Tests with screenshot upload
```

## How It Works

1. **Test fails** → Playwright automatically captures a screenshot
2. **After each test** → `test.afterEach` hook runs
3. **Check for failure** → If test failed, screenshot path is found
4. **Upload to Drive** → Screenshot is uploaded to "Hacker News Screen Shots" folder
5. **Filename format** → `failure_<test_name>_<timestamp>.png`

## Next Steps

- Run your tests: `npm run playwright`
- Failed tests will automatically upload screenshots to Google Drive
- Check the "Hacker News Screen Shots" folder in your Google Drive

Need help? Check the console logs for detailed error messages!
