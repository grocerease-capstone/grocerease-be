/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';
import Response from '../dto/response.js';

const secret = process.env.JWT_SECRET;

const createToken = (payload) => {
  const result = jwt.sign(payload, secret);
  return result;
};

const verifyToken = (req, res, next) => {
  const authorizationHeader = req.get('Authorization');

  if (!authorizationHeader) {
    const response = Response.defaultUnauthorized({ error: 'Token not provided' });
    return res.status(response.code).json(response);
  }

  const token = authorizationHeader.split(' ').pop();

  try {
    const decoded = jwt.verify(token, secret);
    res.locals.decodedToken = decoded;
    return next();
  } catch (error) {
    const response = Response.defaultUnauthorized({ error: error });
    return res.status(response.code).json(response);
  }
};

export { createToken, verifyToken };


