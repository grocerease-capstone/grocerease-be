import express from 'express';
import {
  acceptShareRequestHandler,
  createShareRequestHandler,
  getAllShareRequestHandler,
} from '../controllers/index.js';
import { verifyToken } from '../middlewares/jwt.js';

const shareRequestRoutes = express.Router();

shareRequestRoutes.get('/test', (req, res) => {
  res.send('Share request routes are connected.');
});

shareRequestRoutes.get('/', verifyToken, getAllShareRequestHandler);

// untuk accept request yang di share oleh user lain
shareRequestRoutes.get(
  '/:shareRequestId',
  verifyToken,
  acceptShareRequestHandler
);

// untuk membuat share request baru ke user lain
shareRequestRoutes.post('/:listId', verifyToken, createShareRequestHandler);

export default shareRequestRoutes;
