import express from 'express';
import { profileUpload } from '../middlewares/index.js';
import { 
  getUserByIdHandler, 
  updateUserHandler,
  deleteUserHandler,
} from '../controllers/index.js';

const userRoutes = express.Router();

userRoutes.get('/', getUserByIdHandler);
userRoutes.put('/', profileUpload, updateUserHandler);
userRoutes.delete('/', deleteUserHandler);

// userRoutes.get('/testnotif', (req, res) => {
//   messaging.send({
//     token: '', 
//     notification: {
//       title: 'Test notif', 
//       body: 'This is the body', 
//     }, 
//     data: {
//       bebas: 'This is id'
//     }
//   });
// });

export default userRoutes;