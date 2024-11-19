import user_route from './user_route.js';

const appRoutes = (app) => {
  app.use('/', user_route);
  return app;
};

export default appRoutes;
