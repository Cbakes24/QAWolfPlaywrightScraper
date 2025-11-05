import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

/**
 * Read credentials file and prompt for authorization code
 */
async function setupAuth() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ credentials.json not found!');
    console.log('\nPlease follow these steps:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project or select existing one');
    console.log('3. Enable Google Drive API');
    console.log('4. Create OAuth 2.0 credentials');
    console.log('5. Download credentials and save as credentials.json in this directory');
    console.log('\nSee GOOGLE_DRIVE_SETUP.md for detailed instructions.');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Get authorization code from command line or prompt
  const authCode = process.argv[2];

  if (!authCode) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('\n📋 Authorization URL:');
    console.log(authUrl);
    console.log('\n📝 Instructions:');
    console.log('1. Open the URL above in your browser');
    console.log('2. Sign in with your Google account');
    console.log('3. Click "Allow" to grant permissions');
    console.log('4. Copy the "code" parameter from the redirect URL');
    console.log('5. Run this command again with the code:');
    console.log(`   node setupGoogleDrive.js <code>\n`);
    process.exit(0);
  }

  try {
    // Exchange code for token
    const { tokens } = await oAuth2Client.getToken(authCode);
    oAuth2Client.setCredentials(tokens);

    // Store token
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('✅ Token stored successfully!');
    console.log(`Token saved to: ${TOKEN_PATH}`);
    console.log('\nYou can now run Playwright tests and screenshots will be uploaded to Google Drive.');
  } catch (error) {
    console.error('❌ Error retrieving access token:', error.message);
    console.log('\nMake sure the authorization code is correct and try again.');
    process.exit(1);
  }
}

setupAuth();
