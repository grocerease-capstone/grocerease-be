import express from 'express';

const userRoute = express.Router();

userRoute.get('/', (req, res) => {
  res.send('List of users');
});

userRoute.post('/', (req, res) => {
  // Handle user creation logic here
  res.send('Create a user');
});


export default userRoute;
