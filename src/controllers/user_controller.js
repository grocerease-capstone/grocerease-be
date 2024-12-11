import { userUpdateValidator } from '../validators/index.js';
import { User, List, ProductItem } from '../models/index.js';
import { encrypt, verifyEncryption } from '../utils/bcrypt.js';
import { convertFileName } from '../utils/file_process.js';
import { Op } from 'sequelize';
import moment from 'moment';
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

  const endDate = moment();
  const startDate = moment().subtract(28, 'days');

  const trackLists = await List.findAll({
    where: {
      UserId: decodedToken.id,
      type: 'Track',
      boughtAt: {
        [Op.between]: [startDate.toDate(), endDate.toDate()]
      }
    },
    attributes: ['id', 'totalExpenses', 'totalItems', 'boughtAt'],
    order: [['boughtAt', 'ASC']]
  });

  const listsByWeek = [];

  for (let i = 0; i < 4; i++) {
    // Calculate week start and end dates
    const weekStart = moment(endDate).subtract((4 - i) * 7, 'days').startOf('day');
    const weekEnd = moment(endDate).subtract((3 - i) * 7, 'days').endOf('day');

    // Filter and aggregate lists for this week
    const weeklyLists = trackLists.filter((list) => {
      const boughtAt = moment(list.boughtAt);
      return boughtAt.isBetween(weekStart, weekEnd, null, '[]');
    });

    // Calculate total expenses and items for the week
    const weekData = {
      week: `Week ${i + 1}`,
      data: {
        total_expenses: weeklyLists.reduce((sum, list) => Number(sum) + Number(list.totalExpenses), 0),
        total_items: weeklyLists.reduce((sum, list) => Number(sum) +Number(list.totalItems), 0),
      }
    };

    listsByWeek.push(weekData);
  }

  response = Response.defaultOK('User obtained successfully.', { userProfile, listsByWeek });
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
};