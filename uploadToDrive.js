import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_NAME = 'Hacker News Screen Shots';

/**
 * Get authenticated OAuth2 client
 */
async function getAuthClient() {
  const credentialsPath = path.join(__dirname, 'credentials.json');
  const tokenPath = path.join(__dirname, 'token.json');

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      'credentials.json not found! Please follow the setup instructions in GOOGLE_DRIVE_SETUP.md'
    );
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have a token
  if (fs.existsSync(tokenPath)) {
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // If no token, get new one
  return await getAccessToken(oAuth2Client, tokenPath);
}

/**
 * Get and store new token after prompting for user authorization
 */
async function getAccessToken(oAuth2Client, tokenPath) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  console.log('\nAfter authorization, you will be redirected. Copy the "code" parameter from the URL.');
  console.log('\nThen run: node setupGoogleDrive.js <code>');

  // For automated flow, we'll use a helper script
  throw new Error('No token found. Please run setupGoogleDrive.js first to authenticate.');
}

/**
 * Find or create folder in Google Drive
 */
async function findOrCreateFolder(drive) {
  // Search for existing folder
  const response = await drive.files.list({
    q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (response.data.files.length > 0) {
    console.log(`Found existing folder: ${FOLDER_NAME}`);
    return response.data.files[0].id;
  }

  // Create folder if it doesn't exist
  const fileMetadata = {
    name: FOLDER_NAME,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
  });

  console.log(`Created folder: ${FOLDER_NAME}`);
  return folder.data.id;
}

/**
 * Upload screenshot to Google Drive
 */
async function uploadScreenshot(screenshotPath) {
  try {
    if (!fs.existsSync(screenshotPath)) {
      throw new Error(`Screenshot file not found: ${screenshotPath}`);
    }

    const auth = await getAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    // Find or create folder
    const folderId = await findOrCreateFolder(drive);

    // Upload file
    const fileName = path.basename(screenshotPath);
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: 'image/png',
      body: fs.createReadStream(screenshotPath),
    };

    console.log(`Uploading ${fileName} to Google Drive...`);
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    console.log(`✅ Successfully uploaded to Google Drive!`);
    console.log(`   File ID: ${file.data.id}`);
    console.log(`   View link: ${file.data.webViewLink}`);
    
    return file.data;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error.message);
    throw error;
  }
}

export { uploadScreenshot, getAuthClient };

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const screenshotPath = process.argv[2] || path.join(__dirname, 'playwright-report-screenshot.png');
  uploadScreenshot(screenshotPath)
    .then(() => {
      console.log('Upload complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Upload failed:', error.message);
      process.exit(1);
    });
}
