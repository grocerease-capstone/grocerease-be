/* eslint-disable camelcase */
// import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { sequelize } from '../models/definitions.js';
import {
  User,
  List,
  ProductItem,
  UserList,
  TempUserList,
} from '../models/index.js';
import { convertFileName } from '../utils/file_process.js';
import { listValidator, updateListValidator } from '../validators/index.js';
import Response from '../dto/response.js';
import uploadFileToStorage from '../config/storage.js';

let response;
const imagePrefix = '../../image_upload/';
const default_receipt = 'default_images/default_noreceipt.jpg';

// POST List (Track or Plan)
const createListHandler = async (req, res) => {
  const reqBody = req.body;
  const reqFiles = req.files;
  const reqProductItems = reqBody.product_items;
  // let receiptImageName = default_receipt;
  // let thumbnailImageName = default_receipt;

  let receiptImageName, thumbnailImageName;

  const reqError = listValidator(reqBody);
  if (reqError.length !== 0) {
    response = Response.defaultBadRequest({ errors: reqError });
    return res.status(response.code).json(response);
  }
  
  if (reqFiles.receipt_image && typeof reqFiles.receipt_image === 'object') {
    receiptImageName = convertFileName('receipt_images/', reqFiles.receipt_image[0].originalname);
  }

  if (reqFiles.thumbnail_image && typeof reqFiles.thumbnail_image === 'object') {
    thumbnailImageName = convertFileName('thumbnail_images/', reqFiles.thumbnail_image[0].originalname);
  }

  const date = new Date();

  const { decodedToken } = res.locals;
  const createListTransaction = async (t) => {
    const user = await User.findOne(
      {
        where: {
          id: decodedToken.id,
        },
      },
      { transaction: t }
    );
    const createList = await List.create({
      title: reqBody.title,
      type: reqBody.type,
      receiptImage: receiptImageName ? receiptImageName : default_receipt,
      thumbnailImage: thumbnailImageName ? thumbnailImageName : default_receipt,
      totalExpenses: reqBody.total_expenses === '' ? 0 : reqBody.total_expenses,
      totalItems: reqBody.total_items,
      boughtAt: reqBody.boughtAt === '' ? date : reqBody.boughtAt,
      UserId: user.id,
    }, { transaction: t });

    const createProductList = JSON.parse(reqProductItems).map((product) => ({
      ListId: createList.id,
      name: product.name,
      amount: product.amount,
      price: product.price,
      totalPrice: product.total_price,
      category: product.category,
    }));
    await ProductItem.bulkCreate(createProductList, { transaction: t });
  };

  try {
    await sequelize.transaction(createListTransaction);
  } catch (e) {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  }

  // Cloud Upload
  // if (receiptImageName) {
  //   await uploadFileToStorage(process.env.GC_STORAGE_BUCKET, receiptImageName, reqFiles.receipt_image[0].buffer);
  // }

  // if (thumbnailImageName) {
  //   await uploadFileToStorage(process.env.GC_STORAGE_BUCKET, thumbnailImageName, reqFiles.thumbnail_image[0].buffer);
  // }

  // Local Upload
  if (receiptImageName) {
    await uploadFileToStorage(
      '../../image_upload',
      receiptImageName,
      reqFiles.receipt_image[0].buffer
    );
  }

  if (thumbnailImageName) {
    await uploadFileToStorage(
      '../../image_upload',
      thumbnailImageName,
      reqFiles.thumbnail_image[0].buffer
    );
  }

  response = Response.defaultOK('New list added successfully.', null);
  return res.status(response.code).json(response);
};

// GET All List (Track or Plan)
const getAllListHandler = async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  const { decodedToken } = res.locals;

  if (type === null) {
    response = Response.defaultBadRequest({ message: 'List type is missing.' });
    return res.status(response.code).json(response);
  }

  let trackLists, trackCount;

  const offset = (page - 1) * limit;
  const parsedLimit = parseInt(limit, 10);

  if (type === 'Track') {
    trackLists = await List.findAll({
      where: {
        UserId: decodedToken.id,
        type,
      },
      attributes: [
        'id',
        'title',
        'receiptImage',
        'thumbnailImage',
        'type',
        'totalExpenses',
        'totalItems',
        'boughtAt',
      ],
      limit: parsedLimit,
      offset,
      order: [['boughtAt', 'DESC']],
    });

    trackCount = await List.findAndCountAll({
      where: {
        UserId: decodedToken.id,
        type,
      },
      attributes: ['id'],
    });
  } else if (type === 'Plan') {
    trackLists = await List.findAll({
      where: {
        UserId: decodedToken.id,
        type,
      },
      attributes: [
        'id',
        'title',
        'receiptImage',
        'thumbnailImage',
        'type',
        'totalItems',
        'boughtAt',
      ],
      limit: parsedLimit,
      offset,
      order: [['boughtAt', 'DESC']],
    });

    trackCount = await List.findAndCountAll({
      where: {
        UserId: decodedToken.id,
        type,
      },
      attributes: ['id'],
    });
  }

  if (!trackLists || trackLists.length === 0) {
    response = Response.defaultOK('No lists found for this user');
    return res.status(response.code).json(response);
  }

  const lists = await Promise.all(
    trackLists.map(async (list) => {
      const { count } = await ProductItem.findAndCountAll({
        where: {
          ListId: list.id,
        },
      });

      const listDTO = {};
      listDTO.id = list.id;
      listDTO.title = list.title;
      listDTO.type = list.type;
      listDTO.total_expenses = list.totalExpenses || null;
      listDTO.total_products = count;
      listDTO.total_items = list.totalItems;
      listDTO.boughtAt = list.boughtAt;

      if (!list.thumbnailImage && !list.receiptImage) {
        listDTO.image = `${imagePrefix}default_images/default_image.png`;
      } else {
        listDTO.image = list.thumbnailImage
          ? `${imagePrefix}thumbnail_images/${list.thumbnailImage}`
          : `${imagePrefix}receipt_images/${list.receiptImage}`;
      }

      return listDTO;
    })
  );

  response = Response.customOK(
    'List obtained successfully.',
    { lists },
    {
      total: trackCount.count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(trackCount.count / parsedLimit),
    }
  );
  return res.status(response.code).json(response);
};

const getAllListByDateHandler = async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  const { month } = req.query;
  const { year } = req.query;
  const { decodedToken } = res.locals;

  if (type === null) {
    response = Response.defaultBadRequest({ message: 'List type is missing.' });
    return res.status(response.code).json(response);
  }

  let startDate, endDate, boughtAtDate;

  if (!month && !year) {
    boughtAtDate = undefined;
  } else if (month < 1 || month > 12) {
    response = Response.defaultBadRequest({ message: 'Month filter invalid.' });
    return res.status(response.code).json(response);
  } else {
    const currYear = new Date().getFullYear();
    const targetYear = year || currYear;

    if (!month) {
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
    } else {
      startDate = new Date(targetYear, month - 1, 1);
      endDate = new Date(targetYear, month, 0, 23, 59, 59, 999);
    }

    boughtAtDate = { [Op.between]: [startDate, endDate] };
  }

  let trackLists, trackCount;

  const offset = (page - 1) * limit;
  const parsedLimit = parseInt(limit, 10);

  if (type === 'Track') {
    trackLists = await List.findAll({
      where: {
        UserId: decodedToken.id,
        type,
        ...(boughtAtDate && { boughtAt: boughtAtDate }),
      },
      attributes: [
        'id',
        'title',
        'receiptImage',
        'thumbnailImage',
        'type',
        'totalExpenses',
        'totalItems',
        'boughtAt',
      ],
      limit: parsedLimit,
      offset,
      order: [['boughtAt', 'DESC']],
    });

    trackCount = await List.findAndCountAll({
      where: {
        UserId: decodedToken.id,
        type,
      },
      attributes: ['id'],
    });
  } else if (type === 'Plan') {
    trackLists = await List.findAll({
      where: {
        UserId: decodedToken.id,
        type,
        ...(boughtAtDate && { boughtAt: boughtAtDate }),
      },
      attributes: [
        'id',
        'title',
        'receiptImage',
        'thumbnailImage',
        'type',
        'totalItems',
        'boughtAt',
      ],
      limit: parsedLimit,
      offset,
      order: [['boughtAt', 'DESC']],
    });

    trackCount = await List.findAndCountAll({
      where: {
        UserId: decodedToken.id,
        type,
      },
      attributes: ['id'],
    });
  }

  if (!trackLists || trackLists.length === 0) {
    response = Response.defaultOK('No lists found for this user');
    return res.status(response.code).json(response);
  }

  const lists = await Promise.all(
    trackLists.map(async (list) => {
      const { count } = await ProductItem.findAndCountAll({
        where: {
          ListId: list.id,
        },
      });

      const listDTO = {};
      listDTO.id = list.id;
      listDTO.title = list.title;
      listDTO.type = list.type;
      listDTO.total_expenses = list.totalExpenses || null;
      listDTO.total_products = count;
      listDTO.total_items = list.totalItems;
      listDTO.boughtAt = list.boughtAt;

      if (!list.thumbnailImage && !list.receiptImage) {
        listDTO.image = `${imagePrefix}default_images/default_image.png`;
      } else {
        listDTO.image = list.thumbnailImage
          ? `${imagePrefix}thumbnail_images/${list.thumbnailImage}`
          : `${imagePrefix}receipt_images/${list.receiptImage}`;
      }

      return listDTO;
    })
  );

  response = Response.customOK(
    'Filtered list obtained successfully.',
    { lists },
    {
      total: trackCount.count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(trackCount.count / parsedLimit),
    }
  );
  return res.status(response.code).json(response);
};

const getListById = async (req, res) => {
  const { listId } = req.params;

  if (listId <= 0) {
    response = Response.defaultBadRequest(null);
    return res.status(response.code).json(response);
  }

  const detailList = await List.findOne({
    where: { id: listId },
    attributes: ['title', 'receiptImage', 'thumbnailImage', 'boughtAt'],
    include: {
      model: ProductItem,
      attributes: ['id', 'name', 'amount', 'price', 'totalPrice', 'category'],
    },
  }).catch((e) => {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  });

  if (!detailList) {
    response = Response.defaultNotFound('List not found.');
    return res.status(response.code).json(response);
  }

  const receipt_image = !detailList.receiptImage
    ? `${imagePrefix}default_images/default_image.png`
    : `${imagePrefix}${detailList.receiptImage}`;

  const thumbnail_image = !detailList.thumbnailImage
    ? receipt_image
    : `${imagePrefix}${detailList.thumbnailImage}`;

  const detailItems = detailList.Product_Items.map((detail) => ({
    id: detail.id,
    name: detail.name,
    amount: detail.amount,
    price: detail.price || 0,
    total_price: detail.totalPrice || 0,
    category: detail.category || '',
  }));

  response = Response.defaultOK('List obtained successfully.', {
    detailList,
    detailItems,
    thumbnail_image,
    receipt_image,
  });
  return res.status(response.code).json(response);
};

const updateListHandler = async (req, res) => {
  const { listId } = req.params;
  const reqBody = req.body;

  const reqError = updateListValidator(reqBody);
  if (reqError.length !== 0) {
    response = Response.defaultBadRequest({ errors: reqError });
    return res.status(response.code).json(response);
  }

  if (listId <= 0) {
    response = Response.defaultBadRequest(null);
    return res.status(response.code).json(response);
  }

  try {
    await sequelize.transaction(async (tx) => {
      await List.update({
        title: reqBody.title,
        totalExpenses: reqBody.total_expenses,
        totalItems: reqBody.total_items,
        updatedAt: new Date(),
      },
      { where: { id: listId }, transaction: tx });

      for (const { id, name, amount, price, total_price, category } of reqBody.product_items) {
        console.log({ id, name, amount });
        await ProductItem.update({
          name,
          amount,
          price,
          totalPrice: total_price,
          category,
        }, { where: { id }, transaction: tx });
      }
    });
  } catch (e) {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  }

  response = Response.defaultOK('List updated successfully.');
  return res.status(response.code).json(response);
};

const deleteListHandler = async (req, res) => {
  const { listId } = req.params;

  await List.destroy({
    where: {
      id: listId,
    },
  }).catch((e) => {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  });

  response = Response.defaultOK('List deleted successfully.', null);
  return res.status(response.code).json(response);
};

// query params: listId,
const inviteToListHandler = async (req, res) => {
  const { listId } = req.query;
  const reqBody = req.body;
  // const reqUsers = reqBody.users;

  if (listId <= 0) {
    response = Response.defaultBadRequest(null);
    return res.status(response.code).json(response);
  }

  const invitedUser = await User.findOne({
    where: {
      email: reqBody.email,
    },
    attributes: ['id'],
  }).catch((e) => {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  });

  if (!invitedUser) {
    response = Response.defaultNotFound('User not found.');
    return res.status(response.code).json(response);
  }

  const createInviteListTransaction = async (t) => {
    await TempUserList.create(
      {
        userId: invitedUser.id,
        listId,
      },
      { transaction: t }
    );
  };

  try {
    console.log(invitedUser.id, invitedUser.listId, listId);
    await sequelize.transaction(createInviteListTransaction);
  } catch (e) {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  }

  response = Response.defaultOK('Users invited successfully.', null);
  return res.status(response.code).json(response);
};

const acceptListHandler = async (req, res) => {
  const { listId } = req.params;
  const { decodedToken } = res.locals;
  const reqBody = req.body;
  // const reqUsers = reqBody.users;

  if (listId <= 0) {
    response = Response.defaultBadRequest(null);
    return res.status(response.code).json(response);
  }

  const acceptListTransaction = async (t) => {
    const list = await List.findOne(
      {
        where: {
          id: listId,
        },
      },
      { transaction: t }
    );
    await UserList.create({
      listId: listId,
      UserId: reqBody.userId,
    });
  };

  // try {

  // } catch (e) {

  // }
  const createShareListTransaction = async (t) => {
    // const addedUsers = JSON.parse(reqUsers).map((user) => ({
    //   UserId: user.userId,
    //   ListId: user.listId,
    // }));
    // await UserList.bulkCreate(addedUsers, { transaction: t });
  };

  try {
    await sequelize.transaction(createShareListTransaction);
  } catch (e) {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  }

  response = Response.defaultOK('List shared successfully.', null);
  return res.status(response.code).json(response);
};

export {
  createListHandler,
  getAllListHandler,
  getListById,
  updateListHandler,
  deleteListHandler,
  getAllListByDateHandler,
  acceptListHandler,
  inviteToListHandler,
};
