import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { verifyToken } from '../middlewares/index.js';
import authRoutes from './auth_routes.js';
import listRoutes from './list_routes.js';
import shareRequestRoutes from './share_request_routes.js';
import userRoutes from './user_routes.js';

const appRoutes = (app) => {
  app.get('/', (req, res) => {
    res.send('Back-End is up and running!');
  });

  app.get('/test-auth', verifyToken, (req, res) => {
    res.json({
      message: 'This is a protected route!',
      user: res.locals.decodedToken,
    });
  });

  app.use('/auth', authRoutes);
  app.use('/list', verifyToken, listRoutes);
  app.use('/user', verifyToken, userRoutes);
  app.use('/share-request', verifyToken, shareRequestRoutes);

  // swagger
  const specs = swaggerJSDoc({
    definition: {
      openapi: '3.1.0',
      info: {
        title: 'GrocerEase API Documentation',
        version: '1.0',
        description:
          'This is the API documentation for the GrocerEase application.',
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/docs/*.{js,yaml}'],
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  return app;
};

export default appRoutes;
