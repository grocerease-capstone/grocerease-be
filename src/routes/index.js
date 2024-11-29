import authRoutes from './auth_routes.js';
import listRoutes from './list_routes.js';
import { verifyToken } from '../middlewares/jwt.js';

const appRoutes = (app) => {

  app.get('/', (req, res) => {
    res.send('Back-End is up and running!');
  });

  app.post('/test', (req, res) => {
    res.json({ receivedBody: req.body });
  });

  app.get('/test-auth', verifyToken, (req, res) => {
    res.json({
      message: 'This is a protected route!',
      user: res.locals.decodedToken,
    });
  });

  app.use('/auth', authRoutes);
  app.use('/list', listRoutes);

  return app;
};

export default appRoutes;
