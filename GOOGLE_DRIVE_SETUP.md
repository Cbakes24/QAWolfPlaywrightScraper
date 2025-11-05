# Google Drive Setup Instructions

This guide will help you set up Google Drive OAuth2 authentication to automatically upload Playwright test report screenshots to your Google Drive.

## Prerequisites

- A Google account
- Node.js installed (already done ✅)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "Playwright Screenshots")
5. Click **"Create"**

## Step 2: Enable Google Drive API

1. In your project, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google Drive API"**
3. Click on it and click **"Enable"**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - Choose **"External"** (unless you have a Google Workspace account)
   - Fill in the required fields:
     - App name: "Playwright Screenshots"
     - User support email: Your email
     - Developer contact: Your email
   - Click **"Save and Continue"**
   - On Scopes page, click **"Save and Continue"**
   - On Test users page, add your email and click **"Save and Continue"**
   - Review and click **"Back to Dashboard"**

4. Now create the OAuth client ID:
   - Application type: **"Desktop app"**
   - Name: "Playwright Screenshots Client"
   - Click **"Create"**

5. Download the credentials:
   - Click **"Download JSON"** button
   - Save the file as `credentials.json` in this project directory

## Step 4: Authenticate with Google Drive

1. Run the setup script:
   ```bash
   node setupGoogleDrive.js
   ```

2. You'll see an authorization URL. Open it in your browser:
   - Sign in with your Google account
   - Click **"Allow"** to grant permissions
   - You'll be redirected to a URL with a `code` parameter

3. Copy the entire `code` value from the URL (it will be a long string)

4. Run the setup script again with the code:
   ```bash
   node setupGoogleDrive.js <paste-your-code-here>
   ```

5. You should see: ✅ Token stored successfully!

## Step 5: Test the Upload

You can test the upload manually:

```bash
# First, run Playwright tests to generate a report
npm run playwright

# Then upload the screenshot
node uploadReportScreenshot.js
```

Or use the combined command:

```bash
npm run playwright:upload
```

## Automatic Upload

After setup, screenshots will automatically upload to Google Drive when you run:

```bash
npm run playwright
```

The screenshot will be saved in a folder called **"Hacker News Screen Shots"** in your Google Drive.

## Troubleshooting

### "credentials.json not found"
- Make sure you downloaded the OAuth credentials JSON file
- Rename it to `credentials.json` (exactly this name)
- Place it in the project root directory

### "No token found"
- Run `node setupGoogleDrive.js` to authenticate
- Make sure you copied the entire authorization code

### "Permission denied" errors
- Make sure you enabled Google Drive API in Google Cloud Console
- Check that your OAuth consent screen is configured

### Token expired
- Tokens can expire. If you get authentication errors, delete `token.json` and run `node setupGoogleDrive.js` again

## Files Created

- `credentials.json` - Your OAuth2 credentials (keep this private!)
- `token.json` - Your access token (keep this private!)
- `playwright-report-screenshot.png` - The screenshot file (can be deleted)

## Security Notes

⚠️ **Important**: Never commit `credentials.json` or `token.json` to version control!
- These files are already in `.gitignore`
- They contain sensitive authentication information
