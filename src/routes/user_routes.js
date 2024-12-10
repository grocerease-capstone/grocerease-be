import express from 'express';
import { profileUpload } from '../middlewares/index.js';
import { 
  getUserByIdHandler, 
  updateUserHandler,
  deleteUserHandler,
  getUserExpenditureHandler,
} from '../controllers/index.js';
import { messaging } from '../config/firebase.js';

const userRoutes = express.Router();

userRoutes.get('/', getUserByIdHandler);
userRoutes.put('/', profileUpload, updateUserHandler);
userRoutes.delete('/', deleteUserHandler);

userRoutes.get('/testnotif', (req, res) => {
  messaging.send({
    token: 'e1MgEbDWTCKP_ogzGRQ6XR:APA91bE2yFC0i3ien_j0DqHCD2zOBHw1IfrwCOZSg7uM9J13jgaiJGlsN3GkMZgfOcVu3MOFwCVFz5GCtZFIz4_nmcxkPNVhOMTe3udQ9kbaz1eNosLzfy8', 
    notification: {
      title: 'Test notif', 
      body: 'This is the body', 
    }, 
    data: {
      bebas: 'This is id'
    }
  });
});

export default userRoutes;