import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import readline from 'readline';
import { getAuthUrl, getTokens } from './googleDriveUpload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Start a local HTTP server to catch OAuth redirect
 * @param {number} port - Port number for the server
 * @returns {Promise<string>} - Authorization code from redirect
 */
function startLocalServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>Authentication Error</h1>
              <p>Error: ${error}</p>
              <p>You can close this window.</p>
            </body>
          </html>
        `);
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>✅ Authentication Successful!</h1>
              <p>You can close this window and return to the terminal.</p>
            </body>
          </html>
        `);
        server.close();
        resolve(code);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>Waiting for authorization...</h1>
              <p>Please complete the authorization in your browser.</p>
            </body>
          </html>
        `);
      }
    });

    server.listen(port, () => {
      console.log(`\n🌐 Local server started on http://localhost:${port}`);
      console.log('   Waiting for OAuth redirect...\n');
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authentication timeout - no response received'));
    }, 300000);
  });
}

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

  // Check if this is a Desktop app or Web app
  const isDesktopApp = !!credentials.installed;
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  // For Desktop apps, use the redirect URI from credentials or default to oob
  // For Web apps, use localhost:8080 with a local server
  let redirectUri;
  let useLocalServer = false;
  
  if (isDesktopApp) {
    // Desktop apps: use the redirect URI from credentials, or use manual code entry
    redirectUri = redirect_uris && redirect_uris[0] ? redirect_uris[0] : 'urn:ietf:wg:oauth:2.0:oob';
    console.log('📱 Detected Desktop app OAuth client');
    console.log('   Using manual code entry flow (no local server needed)\n');
  } else {
    // Web apps: use localhost:8080 with local server
    redirectUri = 'http://localhost:8080';
    useLocalServer = true;
    console.log('🌐 Detected Web application OAuth client');
    console.log('   Using local server to catch redirect\n');
  }
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
  );

  const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('🔐 Please visit this URL to authorize the application:');
  console.log(authUrl);
  console.log('\n');

  try {
    let code;
    
    if (useLocalServer) {
      // Web app: use local server to catch redirect
      console.log('📝 Note: Make sure your Google Cloud Console OAuth client has:');
      console.log(`   Redirect URI: ${redirectUri}`);
      console.log('   If not, update it in Google Cloud Console → APIs & Services → Credentials\n');
      
      code = await startLocalServer(8080);
    } else {
      // Desktop app: manual code entry
      console.log('📋 After authorizing, you will be redirected to a page with a code.');
      console.log('   Copy the entire code from the URL or the page and paste it below.\n');
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      code = await new Promise((resolve, reject) => {
        rl.question('Enter the authorization code: ', (enteredCode) => {
          rl.close();
          if (!enteredCode || enteredCode.trim() === '') {
            reject(new Error('No authorization code provided'));
          } else {
            resolve(enteredCode.trim());
          }
        });
      });
    }

    // Exchange code for tokens
    const tokens = await getTokens(oAuth2Client, code);

    // Save tokens
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
    console.log('\n✅ Token saved successfully to token.json');
    console.log('   You can now run tests with Google Drive upload enabled!');
  } catch (error) {
    console.error('❌ Error during authentication:', error.message);
    throw error;
  }
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
