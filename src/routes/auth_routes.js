import express from 'express';
import { profileUpload, verifyToken } from '../middlewares/index.js';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
} from '../controllers/index.js';


const authRoutes = express.Router();

authRoutes.post('/register', profileUpload, registerHandler);
authRoutes.post('/login', loginHandler);
authRoutes.post('/logout', verifyToken, logoutHandler);

export default authRoutes;