import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../models/definitions.js';
import { registerValidator, loginValidator } from '../validators/index.js';
import { User, Session } from '../models/index.js';
import { encrypt, verifyEncryption } from '../utils/bcrypt.js';
import { createToken, verifyToken } from '../middlewares/jwt.js';
import Response from '../dto/response.js';

const registerHandler = async (req, res) => {
  let response;
  const reqBody = req.body;
  console.log('Request Body:', req.body);

  const reqError = registerValidator(reqBody);
  if (reqError.length !== 0) {
    response = Response.defaultBadRequest({ errors: reqError });
    return res.status(response.code).json(response);
  }

  const existingEmail = await User.findOne({ where: { email: reqBody.email } });
  if (existingEmail) {
    response = Response.defaultConflict({ errors: reqError });
    return res.status(response.code).json(response);
  }


  const userId = uuidv4();
  const password = await encrypt(reqBody.password);

  const userTransaction = async (t) => {
    await User.create({
      id: userId,
      username: reqBody.username,
      email: reqBody.email,
      password,
    }, { transaction: t });
  };
  const result = await sequelize.transaction(userTransaction).catch((error) => error);
  if (result instanceof Error) {
    const errorMessage = result.errors?.[0]?.message;
    response = Response.defaultConflict({ error: errorMessage });
    return res.status(response.code).json(response);
  }

  response = Response.defaultCreated('Account registered successfully.', null);
  return res.status(response.code).json(response);
};

const loginHandler = async (req, res) => {
  const reqBody = req.body;
  let response;

  const reqError = loginValidator(reqBody);
  if (reqError.length !== 0) {
    response = Response.defaultBadRequest({ errors: reqError });
    return res.status(response.code).json(response);
  }

  const user = await User.findOne({
    where: {
      email: reqBody.email,
    },
  }).catch(() => {
    response = Response.defaultInternalError(null);
    return res.status(response.code).json(response);
  });

  if (!user) {
    response = Response.defaultNotFound(null);
    return res.status(response.code).json(response);
  }

  const verifiedPass = await verifyEncryption(user.password, reqBody.password);
  if (!verifiedPass) {
    response = Response.defaultNotFound(null);
    return res.status(response.code).json(response);
  }

  const jwt = createToken({ id: user.id });
  const sessionId = uuidv4();

  const sessionTransaction = async (t) => {
    await Session.create({
      id: sessionId,
      token: jwt,
      UserId: user.id,
    }, { transaction: t });
  };
  await sequelize.transaction(sessionTransaction);

  res.setHeader('Authorization', jwt);
  response = Response.defaultOK('Login Successful', null); // Kalau mau tampilin JWT di Body, ganti "null" ke "jwt" tanpa quote
  return res.status(response.code).json(response);
};

export {
  registerHandler,
  loginHandler,
};