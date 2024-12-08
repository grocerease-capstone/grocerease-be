// import express from 'express';
import 'dotenv/config';
import { app, startServer } from './config/index.js';
import appRoutes from './routes/index.js';
import { initDatabaseMigration } from './models/index.js';

await initDatabaseMigration(); // Run database migrations

const routes = appRoutes(app);
startServer(routes);