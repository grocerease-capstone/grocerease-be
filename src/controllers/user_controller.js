import { userUpdateValidator } from '../validators/index.js';
import { User, List, ProductItem } from '../models/index.js';
import { encrypt, verifyEncryption } from '../utils/bcrypt.js';
import { convertFileName } from '../utils/file_process.js';
import { Op } from 'sequelize';
import Response from '../dto/response.js';
import uploadFileToStorage from '../config/storage.js';

let response;

const getUserByIdHandler = async (req, res) => {
  const { decodedToken } = res.locals;

  const userProfile = await User.findOne({
    where: { id: decodedToken.id },
    attributes: ['username', 'email', 'image'],
  }).catch((e) => {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  });

  const startDate = new Date();
  const endDate = new Date();
  startDate.setDate(endDate.getDate() - 28);

  console.log(startDate, endDate);

  const year = new Date().getFullYear;
  const month = new Date().getMonth;

  const boughtAtDate = { [Op.between]: [startDate, endDate] };

  const trackLists = await List.findAll({
    where: {
      UserId: decodedToken.id,
      type: 'Track',
      boughtAt: { [Op.between]: [startDate, endDate] },
    },
    attributes: ['id', 'totalExpenses', 'totalItems', 'boughtAt'],
  }).catch((e) => {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  });

  console.log(typeof trackLists);

  const lists = await Promise.all(
    trackLists.map(async (list) => {
      const { count } = await ProductItem.findAndCountAll({
        where: {
          ListId: list.id,
        },
      });

      const listDTO = {};
      listDTO.total_expenses = list.totalExpenses || null;
      listDTO.total_products = count;
      listDTO.total_items = list.totalItems;
      listDTO.boughtAt = list.boughtAt;

      return listDTO;
    })
  );

  response = Response.defaultOK('User obtained successfully.', { userProfile, lists });
  return res.status(response.code).json(response);
};

const getUserExpenditureHandler = async (req, res) => {
  const { decodedToken } = res.locals;

  // if (type === null) {
  //   response = Response.defaultBadRequest({ message: 'List type is missing.' });
  //   return res.status(response.code).json(response);
  // }

  // let startDate, endDate;

  // const year = new Date().getFullYear;
  // const month = new Date().getMonth;


  // if (!month && !year) {
  //   boughtAtDate = undefined;
  // } else if (month < 1 || month > 12) {
  //   response = Response.defaultBadRequest({ message: 'Month filter invalid.' });
  //   return res.status(response.code).json(response);
  // } else {
  //   const currYear = new Date().getFullYear();
  //   const targetYear = year || currYear;

  //   if (!month) {
  //     startDate = new Date(targetYear, 0, 1);
  //     endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
  //   } else {
  //     startDate = new Date(targetYear, month - 1, 1);
  //     endDate = new Date(targetYear, month, 0, 23, 59, 59, 999);
  //   }
  // }

  const startDate = new Date();
  const endDate = new Date();
  startDate.setDate(endDate.getDate() - 28);

  const boughtAtDate = { [Op.between]: [startDate, endDate] };

  const trackLists = await List.findAll({
    where: {
      UserId: decodedToken.id,
      type: 'Track',
      ...(boughtAtDate && { boughtAt: boughtAtDate }),
    },
    attributes: ['totalExpenses', 'totalItems'],
  });

  const lists = await Promise.all(
    trackLists.map(async (list) => {
      const { count } = await ProductItem.findAndCountAll({
        where: {
          ListId: list.id,
        },
      });

      const listDTO = {};
      listDTO.total_expenses = list.totalExpenses || null;
      listDTO.total_products = count;
      listDTO.total_items = list.totalItems;

      return listDTO;
    })
  );

  response = Response.customOK(
    'Filtered list obtained successfully.',
    { lists },
  );
  return res.status(response.code).json(response);

};

const updateUserHandler = async (req, res) => {
  const reqBody = req.body;
  const reqFiles = req.files;
  const { decodedToken } = res.locals;

  const reqError = userUpdateValidator(reqBody);
  if (reqError.length !== 0) {
    response = Response.defaultBadRequest({ errors: reqError });
    return res.status(response.code).json(response);
  }

  const currentUser = await User.findOne({
    where: { 
      id: decodedToken.id 
    },
    attributes: ['id', 'username', 'password', 'image'],
  }).catch(() => {
    response = Response.defaultInternalError(null);
    return res.status(response.code).json(response);
  });

  if (reqFiles.profile_image) {
    const profileImageName = convertFileName('profile_images/', reqFiles.profile_image[0].originalname);
    await uploadFileToStorage('../../image_upload', profileImageName, reqFiles.profile_image[0].buffer);

    // await uploadFileToStorage(process.env.GC_STORAGE_BUCKET, profileImageName, reqFiles.profile_image[0].buffer);

    currentUser.image = profileImageName;
  }

  if (reqBody.new_password != '' && reqBody.password != '') {
    const verifiedPass = await verifyEncryption(currentUser.password, reqBody.password);
    if (!verifiedPass) {
      response = Response.defaultNotFound(null);
      return res.status(response.code).json(response);
    }

    const hashedPassword = await encrypt(reqBody.new_password);
    currentUser.password = hashedPassword;
  }

  currentUser.username = reqBody.username;

  await currentUser.save();

  response = Response.defaultOK('Profile updated successfully.');
  return res.status(response.code).json(response);
};

const deleteUserHandler = async (req, res) => {
  const { decodedToken } = res.locals;

  await User.destroy({
    where: {
      id: decodedToken.id,
    },
  }).catch((e) => {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  });

  response = Response.defaultOK('User deleted successfully.', null);
  return res.status(response.code).json(response);
};

export {
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
  getUserExpenditureHandler,
};