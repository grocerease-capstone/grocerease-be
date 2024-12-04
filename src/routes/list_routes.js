import express from 'express';
import { imageUploads } from '../middlewares/index.js';
import { verifyToken } from '../middlewares/jwt.js';
import { 
  createListHandler, 
  deleteListHandler, 
  getAllListHandler, 
  getListById, 
  updateListHandler,
  getAllListByDateHandler,
} from '../controllers/list_controller.js';

const listRoutes = express.Router();

listRoutes.get('/test', (req, res) => { res.send('List routes are connected.'); });
listRoutes.get('/', verifyToken, getAllListHandler);
listRoutes.get('/filter', verifyToken, getAllListByDateHandler);
listRoutes.get('/:listId', verifyToken, getListById);

listRoutes.post('/', verifyToken, imageUploads, createListHandler);

listRoutes.put('/:listId', verifyToken, imageUploads, updateListHandler);

listRoutes.delete('/:listId', verifyToken, deleteListHandler);

export default listRoutes;