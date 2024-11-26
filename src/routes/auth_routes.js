import express from 'express';
import {
  registerHandler,
  loginHandler,
} from '../controllers/index.js';

const authRoutes = express.Router();

authRoutes.post('/register', registerHandler);
authRoutes.post('/login', loginHandler);

export default authRoutes;