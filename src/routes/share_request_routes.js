import express from 'express';
import {
  acceptShareRequestHandler,
  createShareRequestHandler,
  getAllShareRequestHandler,
  rejectShareRequestHandler
} from '../controllers/index.js';
// import { messaging } from '../config/firebase.js';

const shareRequestRoutes = express.Router();

shareRequestRoutes.get('/test', (req, res) => {
  res.send('Share request routes are connected.');
});

shareRequestRoutes.get('/', getAllShareRequestHandler);

shareRequestRoutes.get('/:shareRequestId', acceptShareRequestHandler);
shareRequestRoutes.delete('/:shareRequestId', rejectShareRequestHandler);

shareRequestRoutes.post('/:listId', createShareRequestHandler);

export default shareRequestRoutes;
