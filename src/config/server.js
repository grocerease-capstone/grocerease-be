/* eslint-disable no-undef */
/*import express from 'express';

const app = express();
app.use(express.json());


const startServer = (appRoutes) => {
  appRoutes.listen(process.env.PORT);
};

export { app, startServer };*/

import express from 'express';
import { initDatabaseMigration } from '../models/index.js';
import appRoutes from '../routes/index.js';

const app = express();
app.use(express.json());

// Setup routes later in the app
const startServer = async () => {
  try {
    initDatabaseMigration(); // Run database migrations

    appRoutes(app); // Apply routes

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error initializing database migration or starting server:', error);
  }
};

export { app, startServer };
