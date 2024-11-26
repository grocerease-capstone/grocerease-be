/* eslint-disable no-undef */
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GC_PROJECT_ID,
  keyFilename: process.env.GC_KEY_FILE,
});

const uploadFileToStorage = async (bucketName, fileName, contents) => {
  await storage.bucket(bucketName).file(fileName).save(contents);
};

export default uploadFileToStorage;
