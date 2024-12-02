import express from 'express';
import { imageUploads } from '../middlewares/index.js';
import { createListHandler, getAllListHandler } from '../controllers/list_controller.js';
import { verifyToken } from '../middlewares/jwt.js';

const listRoutes = express.Router();

listRoutes.get('/test', (req, res) => { res.send('This is list routes'); });
listRoutes.get('/', verifyToken, getAllListHandler);
listRoutes.post('/', verifyToken, imageUploads, createListHandler);

export default listRoutes;