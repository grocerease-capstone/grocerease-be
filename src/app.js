import 'dotenv/config';
import { app, startServer } from './config/index.js';
import appRoutes from './routes/index.js';

const appRoute = appRoutes(app);
startServer(appRoute);