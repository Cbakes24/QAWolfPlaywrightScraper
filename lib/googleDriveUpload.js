import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize Google Drive API client with OAuth2
 * @param {Object} credentials - OAuth2 credentials object
 * @param {Object} token - OAuth2 token object (can be null for first-time auth)
 * @param {string} tokenPath - Path to token.json file for saving refreshed tokens
 * @returns {Object} - Authenticated Google Drive client
 */
export async function initializeDriveClient(credentials, token, tokenPath = null) {
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (token) {
    oAuth2Client.setCredentials(token);
    
    // Set up token refresh listener to save new tokens automatically
    if (tokenPath) {
      oAuth2Client.on('tokens', (tokens) => {
        // Merge new tokens with existing ones (preserve refresh_token if not in new tokens)
        const updatedToken = {
          ...token,
          ...tokens,
          // Preserve refresh_token if it exists and wasn't updated
          refresh_token: tokens.refresh_token || token.refresh_token
        };
        
        // Save updated tokens to file
        try {
          fs.writeFileSync(tokenPath, JSON.stringify(updatedToken, null, 2));
          console.log('🔄 Token refreshed and saved');
        } catch (error) {
          console.warn('⚠️  Could not save refreshed token:', error.message);
        }
      });
    }
  }

  return google.drive({ version: 'v3', auth: oAuth2Client });
}

/**
 * Get authorization URL for OAuth2 flow
 * @param {Object} credentials - OAuth2 credentials object
 * @returns {Object} - { authUrl, oAuth2Client }
 */
export function getAuthUrl(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  return { authUrl, oAuth2Client };
}

/**
 * Exchange authorization code for tokens
 * @param {Object} oAuth2Client - OAuth2 client instance
 * @param {string} code - Authorization code from callback
 * @returns {Object} - Token object
 */
export async function getTokens(oAuth2Client, code) {
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
}

/**
 * Find or create folder in Google Drive
 * @param {Object} drive - Authenticated Drive client
 * @param {string} folderName - Name of the folder
 * @returns {string} - Folder ID
 */
export async function findOrCreateFolder(drive, folderName) {
  // Search for existing folder (search in user's Drive, not shared folders)
  const response = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'me' in owners`,
    fields: 'files(id, name, webViewLink)',
    spaces: 'drive',
  });

  if (response.data.files && response.data.files.length > 0) {
    const folder = response.data.files[0];
    console.log(`📁 Found existing folder: "${folder.name}" (ID: ${folder.id})`);
    if (folder.webViewLink) {
      console.log(`   Folder link: ${folder.webViewLink}`);
    }
    return folder.id;
  }

  // Create folder if it doesn't exist
  console.log(`📁 Creating new folder: "${folderName}"`);
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    resource: fileMetadata,
    fields: 'id, name, webViewLink',
  });

  console.log(`✅ Created folder: "${folder.data.name}" (ID: ${folder.data.id})`);
  if (folder.data.webViewLink) {
    console.log(`   Folder link: ${folder.data.webViewLink}`);
  }

  return folder.data.id;
}

/**
 * Upload file to Google Drive folder
 * @param {Object} drive - Authenticated Drive client
 * @param {string} filePath - Local file path
 * @param {string} fileName - Name for the file in Drive
 * @param {string} folderId - Google Drive folder ID
 * @returns {Object} - Uploaded file info
 */
export async function uploadFileToDrive(drive, filePath, fileName, folderId) {
  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: 'image/png',
    body: fs.createReadStream(filePath),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    console.log(`✅ Uploaded screenshot to Google Drive: ${file.data.name}`);
    console.log(`   File ID: ${file.data.id}`);
    console.log(`   View file: ${file.data.webViewLink}`);
    
    return file.data;
  } catch (error) {
    console.error('❌ Error uploading file to Google Drive:', error.message);
    throw error;
  }
}

/**
 * Upload screenshot to Google Drive on test failure
 * @param {string} screenshotPath - Path to the screenshot file
 * @param {string} testTitle - Test title for naming the file
 * @param {string} browserName - Browser name (e.g., "chromium", "firefox", "webkit")
 * @returns {Promise<void>}
 */
export async function uploadScreenshotOnFailure(screenshotPath, testTitle, browserName = 'unknown') {
  try {
    // Load credentials
    const credentialsPath = path.join(__dirname, '../credentials.json');
    const tokenPath = path.join(__dirname, '../token.json');

    if (!fs.existsSync(credentialsPath)) {
      console.warn('⚠️  credentials.json not found. Skipping Google Drive upload.');
      console.warn('   Please follow setup instructions in GOOGLE_DRIVE_SETUP.md');
      return;
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    // Load token if it exists
    let token = null;
    if (fs.existsSync(tokenPath)) {
      token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    } else {
      console.warn('⚠️  token.json not found. Please run auth setup first.');
      return;
    }

    // Initialize Drive client with token refresh handling
    const drive = await initializeDriveClient(credentials, token, tokenPath);

    // Find or create folder
    console.log(`\n📸 Starting screenshot upload for test: "${testTitle}"`);
    const folderId = await findOrCreateFolder(drive, 'Hacker News Articles');

    // Generate filename with browser name, shortened date/time, and failDemoTest
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const safeBrowserName = browserName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeBrowserName}_failDemoTest_${dateStr}_${timeStr}.png`;

    // Upload file
    const uploadedFile = await uploadFileToDrive(drive, screenshotPath, fileName, folderId);
    
    // Get folder link for easy access
    try {
      const folderInfo = await drive.files.get({
        fileId: folderId,
        fields: 'webViewLink, name',
      });
      if (folderInfo.data.webViewLink) {
        console.log(`\n📂 Open folder: ${folderInfo.data.webViewLink}`);
      }
    } catch (error) {
      // Non-critical, just log
      console.log(`   (Could not retrieve folder link: ${error.message})`);
    }
  } catch (error) {
    console.error('❌ Failed to upload screenshot to Google Drive:', error.message);
    
    // If it's an invalid_grant error, the token needs to be refreshed
    if (error.message.includes('invalid_grant') || error.message.includes('Token has been expired or revoked')) {
      console.error('\n🔐 Your OAuth token has expired or been revoked.');
      console.error('   To fix this, run: node lib/authGoogleDrive.js');
      console.error('   This will re-authenticate and generate a new token.\n');
    }
    
    // Don't throw - we don't want test failures to prevent screenshot uploads
  }
}
