import express from 'express';
import { imageUploads } from '../middlewares/index.js';
import { verifyToken } from '../middlewares/jwt.js';
import { 
  createListHandler, 
  getAllListHandler, 
  getListById 
} from '../controllers/list_controller.js';

const listRoutes = express.Router();

listRoutes.get('/test', (req, res) => { res.send('List routes are connected.'); });
listRoutes.get('/', verifyToken, getAllListHandler);
listRoutes.get('/:listId', verifyToken, getListById);

listRoutes.post('/', verifyToken, imageUploads, createListHandler);

export default listRoutes;