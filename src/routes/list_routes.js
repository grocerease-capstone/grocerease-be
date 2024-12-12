import express from 'express';
import {
  createListHandler,
  deleteListHandler,
  getAllListByDateHandler,
  getAllListHandler,
  getAllSharedListHandler,
  getListById,
  updateListHandler,
} from '../controllers/index.js';
import { imageUploads } from '../middlewares/index.js';

const listRoutes = express.Router();

listRoutes.get('/test', (req, res) => {
  res.send('List routes are connected.');
});

listRoutes.get('/', getAllListHandler);
listRoutes.get('/filter', getAllListByDateHandler);
listRoutes.get('/shared', getAllSharedListHandler);
listRoutes.get('/:listId', getListById);

listRoutes.post('/', imageUploads, createListHandler);

listRoutes.put('/:listId', imageUploads, updateListHandler);

listRoutes.delete('/:listId', deleteListHandler);

export default listRoutes;
