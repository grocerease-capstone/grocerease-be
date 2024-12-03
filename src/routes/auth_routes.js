import express from 'express';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
} from '../controllers/index.js';
import { verifyToken } from '../middlewares/jwt.js';

const authRoutes = express.Router();

authRoutes.post('/register', registerHandler);
authRoutes.post('/login', loginHandler);
authRoutes.post('/logout', verifyToken, logoutHandler);

export default authRoutes;