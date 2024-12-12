/* eslint-disable no-undef */
import { Storage } from '@google-cloud/storage';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = new Storage({
  projectId: process.env.GC_PROJECT_ID,
  keyFilename: process.env.GC_KEY_FILE,
});

// Cloud Bucket
// const uploadFileToStorage = async (bucketName, fileName, contents) => {
//   await storage.bucket(bucketName).file(fileName).save(contents);
// };

const deleteFromStorage = async (bucketName, fileName) => {
  await storage.bucket(bucketName).file(fileName).delete();
};

// Upload to local '../../image_upload'
const uploadFileToStorage = async (localDir, fileName, contents) => {
  try {
    const targetDir = path.resolve(__dirname, localDir);

    await fs.mkdir(targetDir, { recursive: true });
    await fs.mkdir(localDir, { recursive: true });
    const filePath = path.join(targetDir, fileName);

    await fs.writeFile(filePath, contents);
    console.log(`File saved locally at: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error saving file locally:', error);
    throw error;
  }
};

export { uploadFileToStorage, deleteFromStorage };
