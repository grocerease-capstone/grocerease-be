/* eslint-disable no-undef */
/*import { storage } from '@google-cloud/storage';

const storage = new Storage({
  projectID: process.env.GC_PROJECT_ID,
  keyFilename: process.env.GC_STORAGE_BUCKET,
});

export */
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

/**
 * Upload file contents to the local database
 * @param {string} tableName - The name of the table to store the file.
 * @param {string} fileName - The name of the file (used as a reference or identifier).
 * @param {Buffer|string} contents - The file contents as a Buffer or string.
 */
const uploadFileToDatabase = async (tableName, fileName, contents) => {
  const connection = await pool.getConnection();
  try {
    const query = `
      INSERT INTO ?? (file_name, file_contents) 
      VALUES (?, ?)
    `;
    await connection.query(query, [tableName, fileName, contents]);
  } catch (error) {
    console.error('Error uploading file to database:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export default uploadFileToDatabase;
