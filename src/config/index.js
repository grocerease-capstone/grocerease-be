import { app, startServer } from './server.js';
import uploadFileToDatabase from './storage.js';
import sequelize from './orm.js';

export {
  app,
  startServer,
  sequelize,
  uploadFileToDatabase,
  
};