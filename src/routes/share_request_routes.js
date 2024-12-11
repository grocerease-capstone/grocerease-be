import express from 'express';
import {
  acceptShareRequestHandler,
  createShareRequestHandler,
  getAllShareRequestHandler,
  rejectShareRequestHandler
} from '../controllers/index.js';
import { verifyToken } from '../middlewares/jwt.js';
import { messaging } from '../config/firebase.js';

const shareRequestRoutes = express.Router();

shareRequestRoutes.get('/test', (req, res) => {
  res.send('Share request routes are connected.');
});

shareRequestRoutes.get('/', verifyToken, getAllShareRequestHandler);

shareRequestRoutes.get('/testnotif', (req, res) => {
  messaging.send({
    token: '', 
    notification: {
      title: 'Test notif', 
      body: 'This is the body', 
    }, 
    data: {
      bebas: 'This is id'
    }
  });
});

// untuk accept request yang di share oleh user lain
shareRequestRoutes.get('/:shareRequestId', verifyToken, acceptShareRequestHandler);
shareRequestRoutes.delete('/:shareRequestId', verifyToken, rejectShareRequestHandler);

// untuk membuat share request baru ke user lain
shareRequestRoutes.post('/:listId', verifyToken, createShareRequestHandler);



export default shareRequestRoutes;

