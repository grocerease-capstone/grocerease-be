//import userRoute from './user_route.js';  // Import separate user routes
import { user } from '../models/index.js'


const appRoutes = (app) => {
  //app.use('/', userRoute);  // Use user route for /users endpoint

  app.get('/', (req, res) => {
    res.send('Hello, World!'); // Ensure response is always sent
    console.log('test');
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
};

export default appRoutes;
