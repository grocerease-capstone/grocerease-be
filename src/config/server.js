/* eslint-disable no-undef */
import express from 'express';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = (appRoutes) => {
  const port = process.env.PORT || 8080;
  appRoutes.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

export { app, startServer };