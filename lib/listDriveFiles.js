import { initializeDriveClient, findOrCreateFolder } from './googleDriveUpload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * List all files in the "Hacker News Articles" folder
 * Useful for debugging and verifying uploads
 */
async function listFilesInFolder() {
  try {
    const credentialsPath = path.join(__dirname, '../credentials.json');
    const tokenPath = path.join(__dirname, '../token.json');

    if (!fs.existsSync(credentialsPath)) {
      console.error('❌ credentials.json not found!');
      process.exit(1);
    }

    if (!fs.existsSync(tokenPath)) {
      console.error('❌ token.json not found! Please run: npm run auth:google');
      process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    const drive = await initializeDriveClient(credentials, token);

    // Find or create folder
    const folderId = await findOrCreateFolder(drive, 'Hacker News Articles');

    // List all files in the folder
    console.log('\n📋 Listing files in "Hacker News Articles" folder:\n');
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, createdTime, webViewLink, size)',
      orderBy: 'createdTime desc',
    });

    if (response.data.files && response.data.files.length > 0) {
      console.log(`Found ${response.data.files.length} file(s):\n`);
      response.data.files.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Created: ${file.createdTime}`);
        console.log(`   File ID: ${file.id}`);
        if (file.webViewLink) {
          console.log(`   Link: ${file.webViewLink}`);
        }
        console.log('');
      });
    } else {
      console.log('⚠️  No files found in the folder.');
      console.log('   The folder exists but is empty.');
    }

    // Get folder link
    const folderInfo = await drive.files.get({
      fileId: folderId,
      fields: 'webViewLink, name',
    });
    
    if (folderInfo.data.webViewLink) {
      console.log(`\n📂 Open folder in Google Drive: ${folderInfo.data.webViewLink}\n`);
    }

  } catch (error) {
    console.error('❌ Error listing files:', error.message);
    if (error.response) {
      console.error('   Details:', error.response.data);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] && process.argv[1].includes('listDriveFiles.js')) {
  listFilesInFolder().catch(console.error);
}

export { listFilesInFolder };
