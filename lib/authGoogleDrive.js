import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { getAuthUrl, getTokens } from './googleDriveUpload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Set up OAuth2 authentication for Google Drive
 * Run this script once to authenticate and save tokens
 */
async function authenticate() {
  const credentialsPath = path.join(__dirname, '../credentials.json');
  const tokenPath = path.join(__dirname, '../token.json');

  // Check if credentials exist
  if (!fs.existsSync(credentialsPath)) {
    console.error('❌ credentials.json not found!');
    console.error('   Please download credentials from Google Cloud Console');
    console.error('   See GOOGLE_DRIVE_SETUP.md for instructions');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

  // Get authorization URL
  const { authUrl, oAuth2Client } = getAuthUrl(credentials);

  console.log('🔐 Please visit this URL to authorize the application:');
  console.log(authUrl);
  console.log('\n');

  // Prompt for authorization code
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the authorization code from the callback URL: ', async (code) => {
      rl.close();

      try {
        // Exchange code for tokens
        const tokens = await getTokens(oAuth2Client, code);

        // Save tokens
        fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
        console.log('✅ Token saved successfully to token.json');
        console.log('   You can now run tests with Google Drive upload enabled!');
        resolve();
      } catch (error) {
        console.error('❌ Error during authentication:', error.message);
        reject(error);
      }
    });
  });
}

// Run authentication if script is executed directly
// This works when running: node lib/authGoogleDrive.js
const isMainModule = process.argv[1] && (
  process.argv[1].includes('authGoogleDrive.js') ||
  import.meta.url === `file://${process.argv[1]}`
);

if (isMainModule) {
  authenticate().catch(console.error);
}

export { authenticate };
