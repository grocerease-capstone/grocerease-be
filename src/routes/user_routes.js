import express from 'express';
import { profileUpload } from '../middlewares/index.js';
import { verifyToken } from '../middlewares/jwt.js';
import { 
  getUserByIdHandler, 
  updateUserHandler,
  deleteUserHandler,
} from '../controllers/index.js';

const userRoutes = express.Router();

userRoutes.get('/', getUserByIdHandler);
userRoutes.put('/', profileUpload, updateUserHandler);
userRoutes.delete('/', deleteUserHandler);

export default userRoutes;