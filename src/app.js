// import express from 'express';
import 'dotenv/config';
import { app, startServer } from './config/index.js';
import appRoutes from './routes/index.js';

const routes = appRoutes(app);
startServer(routes);