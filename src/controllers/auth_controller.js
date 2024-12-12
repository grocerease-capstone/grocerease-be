import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/index.js';
import { User, Session } from '../models/index.js';
import { createToken } from '../middlewares/index.js';
import { registerValidator, loginValidator } from '../validators/index.js';
import { encrypt, verifyEncryption, convertFileName } from '../utils/index.js';
import { uploadFileToStorage } from '../config/index.js';
import Response from '../dto/response.js';

let response;
// const imagePrefix = '../../image_upload/';
const imagePrefix = 'https://storage.googleapis.com/profile_images/';

const registerHandler = async (req, res) => {
  try {
    const reqBody = req.body;
    const reqFiles = req.files;
    
    let profileImageName;
  
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
  
    const profileImagePrefix = 'profile_images/';
    const profileImageDefault = 'default_image.jpg';
    profileImageName = `${profileImagePrefix}${profileImageDefault}`;
    
    if (reqFiles.profile_image && typeof reqFiles.profile_image === 'object') {
      profileImageName = convertFileName(profileImagePrefix, reqFiles.profile_image[0].originalname);
      // await uploadFileToStorage(imagePrefix, profileImageName, reqFiles.profile_image[0].buffer);
      await uploadFileToStorage(process.env.GC_STORAGE_BUCKET, profileImageName, reqFiles.profile_image[0].buffer);
    } 
  
    const userId = uuidv4();
    const password = await encrypt(reqBody.password);

    console.log(reqBody.fcm_token);
  
    const userTransaction = async (t) => {
      await User.create({
        id: userId,
        username: reqBody.username,
        email: reqBody.email,
        password,
        image: profileImageName,
      }, { transaction: t });
    };

    const result = await sequelize.transaction(userTransaction);

    if (result instanceof Error) {
      const errorMessage = result.errors?.[0]?.message;
      response = Response.defaultConflict({ error: errorMessage });
      return res.status(response.code).json(response);
    }
  
    response = Response.defaultCreated('Account registered successfully.', null);
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  }
};

const loginHandler = async (req, res) => {
  try {
    const reqBody = req.body;

    const reqError = loginValidator(reqBody);
    if (reqError.length !== 0) {
      response = Response.defaultBadRequest({ errors: reqError });
      return res.status(response.code).json(response);
    }
  
    const user = await User.findOne({
      where: {
        email: reqBody.email,
      },
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

      await user.update({
        fcmToken: reqBody.fcm_token,
      }, { transaction: t });
    };
    await sequelize.transaction(sessionTransaction);
  
    res.setHeader('Authorization', jwt);
    response = Response.defaultOK('Login Successful', jwt); // Kalau mau tampilin JWT di Body, ganti "null" ke "jwt" tanpa quote
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  }
};

const logoutHandler = async (req, res) => {
  try {
    const token = req.get('Authorization')?.split(' ')?.[1];

    if (!token) {
      response = Response.defaultBadRequest(null);
      return res.status(response.code).json(response);
    }

    const result = await Session.destroy({
      where: { token },
    }).catch(() => {
      response = Response.defaultInternalError(null);
      return res.status(response.code).json(response);
    });

    if (result === 0) {
      response = Response.defaultNotFound(null);
      return res.status(response.code).json(response);
    }

    response = Response.defaultOK('Logout successful.');
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  }
};

export {
  registerHandler,
  loginHandler,
  logoutHandler,
};