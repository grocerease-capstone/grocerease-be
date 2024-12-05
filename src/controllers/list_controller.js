/* eslint-disable camelcase */
// import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { sequelize } from '../models/definitions.js';
import { User, List, ProductItem, UserList, TempUserList } from '../models/index.js';
import { convertFileName } from '../utils/file_process.js';
import { listValidator, updateListValidator } from '../validators/index.js';
import Response from '../dto/response.js';
import uploadFileToStorage from '../config/storage.js';
import { transaction } from '../../../mammates-be/src/models/model_raw.js';

// import { allLists, singleList } from '../dto/request.js';

let response;
const imagePrefix = '../../image_upload/';

// POST List (Track or Plan)
const createListHandler = async (req, res) => {
  const reqBody = req.body;
  const reqFiles = req.files;
  const reqProductItems = reqBody.product_items;
  let thumbnailImageName, receiptImageName;

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
      receiptImage: receiptImageName === null ? null : receiptImageName,
      thumbnailImage: thumbnailImageName === null ? null : thumbnailImageName,
      totalExpenses: reqBody.total_expenses === '' ? 0 : reqBody.total_expenses,
      totalItems: reqBody.total_items,
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
  // await uploadFileToStorage(process.env.BUCKET_NAME, receiptName, reqFiles.mam_image[0].buffer);
  // if (thumbnailImageName) {
  //   await uploadFileToStorage(process.env.BUCKET_NAME, thumbnailImageName, reqFiles.image[0].buffer);
  // }

  // Local Upload
  if (receiptImageName) {
    await uploadFileToStorage('../../image_upload', receiptImageName, reqFiles.receipt_image[0].buffer);
  }

  if (thumbnailImageName) {
    await uploadFileToStorage('../../image_upload', thumbnailImageName, reqFiles.thumbnail_image[0].buffer);
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
      attributes: ['id', 'title', 'receiptImage', 'thumbnailImage', 'type', 'totalExpenses', 'totalItems', 'createdAt'],
      limit: parsedLimit,
      offset,
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
      attributes: ['id', 'title', 'receiptImage', 'thumbnailImage', 'type', 'totalItems', 'createdAt'],
      limit: parsedLimit,
      offset,
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
    response = Response.defaultNotFound('No lists found for this user');
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
      listDTO.createdAt = list.createdAt;

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
    });
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

  let startDate, endDate, createdAtCondition;

  if (!month && !year) {
    createdAtCondition = undefined;
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
  
    createdAtCondition = { [Op.between]: [startDate, endDate] };
  }
  
  let trackLists, trackCount;

  const offset = (page - 1) * limit; 
  const parsedLimit = parseInt(limit, 10);

  if (type === 'Track') {
    trackLists = await List.findAll({
      where: {
        UserId: decodedToken.id,
        type,
        ...(createdAtCondition && { createdAt: createdAtCondition }),
      },
      attributes: ['id', 'title', 'receiptImage', 'thumbnailImage', 'type', 'totalExpenses', 'totalItems', 'createdAt'],
      limit: parsedLimit,
      offset,
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
        ...(createdAtCondition && { createdAt: createdAtCondition }),
      },
      attributes: ['id', 'title', 'receiptImage', 'thumbnailImage', 'type', 'totalItems', 'createdAt'],
      limit: parsedLimit,
      offset,
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
    response = Response.defaultNotFound('No lists found for this user');
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
      listDTO.createdAt = list.createdAt;

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

  response = Response.customOK('Filtered list obtained successfully.', 
    { lists },
    { 
      total: trackCount.count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(trackCount.count / parsedLimit), 
    },
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
    attributes: ['title', 'receiptImage', 'thumbnailImage'],
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

  response = Response.defaultOK('List obtained successfully.', { detailItems, thumbnail_image, receipt_image });
  return res.status(response.code).json(response);
};

const updateListHandler = async (req, res) => {
  const { listId } = req.params;
  const reqBody = req.body;
  const reqFiles = req.files;

  const reqError = updateListValidator(reqBody);
  if (reqError.length !== 0) {
    response = Response.defaultBadRequest({ errors: reqError });
    return res.status(response.code).json(response);
  }

  if (listId <= 0) {
    response = Response.defaultBadRequest(null);
    return res.status(response.code).json(response);
  }

  const currentList = await List.findOne({
    where: { id: listId },
    attributes: ['id', 'title', 'receiptImage', 'thumbnailImage'],
    include: {
      model: ProductItem,
      attributes: ['id', 'name', 'amount', 'price', 'totalPrice', 'category'],
    },
  }).catch((e) => {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  });

  if (currentList instanceof Error) {
    response = Response.defaultNotFound(null);
    return res.status(response.code).json(response);
  }

  const currentProduct = currentList.Product_Items;
  const reqProductItems = reqBody.product_items;

  currentProduct.map(async (product) => {
    const updatedProduct = reqProductItems.find((p) => p.id === product.id);

    product.name = updatedProduct.name;
    product.amount = updatedProduct.amount;
    product.price = updatedProduct.price;
    product.totalPrice = updatedProduct.totalPrice;
    product.category = updatedProduct.category;

    try {
      await product.save();
    } catch (e) {
      response = Response.defaultInternalError({ e });
      return res.status(response.code).json(response);
    }
  });
  
  currentList.id = listId;
  currentList.title = reqBody.title;

  if (reqBody.receiptImage && reqFiles.receipt_image) {
    const receiptImageName = reqBody.receiptImage;
    await uploadFileToStorage('../../image_upload', receiptImageName, reqFiles.receipt_image[0].buffer);
    currentList.receiptImage = receiptImageName;
  }

  if (reqBody.thumbnailImage && reqFiles.thumbnail_image) {
    const thumbnailImageName = reqBody.thumbnailImage;
    await uploadFileToStorage('../../image_upload', thumbnailImageName, reqFiles.thumbnail_image[0].buffer);
    currentList.thumbnailImage = thumbnailImageName;
  }

  await currentList.save();

  response = Response.defaultOK('New list added successfully.');
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

const inviteUserToList = async (req, res) => {
  const { listId } = req.params;
  const reqBody = req.body;
  const reqUsers = reqBody.users;

  if (listId <= 0) {
    response = Response.defaultBadRequest(null);
    return res.status(response.code).json(response);
  }

  const createInviteListTransaction = async (t) => {
    const invitedUsers = JSON.parse(reqUsers).map((user) => ({
      UserId: user.userId,
      ListId: user.listId,
    }));

    await TempUserList.bulkCreate(invitedUsers, { transaction: t });
  };

  try {
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
  // const reqBody = req.body;
  // const reqUsers = reqBody.users;

  if (listId <= 0) {
    response = Response.defaultBadRequest(null);
    return res.status(response.code).json(response);
  }

  const acceptListTransaction = async (t) => {
    const list = await List.findOne({
      where: {
        id: listId,
      },
    }, { transaction: t });
    await UserList.create({
      UserId: decodedToken.id,
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
  inviteUserToList,
};
