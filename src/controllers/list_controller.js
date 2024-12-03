/* eslint-disable camelcase */
// import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../models/definitions.js';
import { User, List, ProductItem } from '../models/index.js';
import { convertFileName } from '../utils/file_process.js';
import { listValidator } from '../validators/index.js';
import Response from '../dto/response.js';
import uploadFileToStorage from '../config/storage.js';
import { allLists, singleList } from '../dto/request.js';

let response;

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
    // thumbnailImageName = receiptImageName;
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

    const createProductList = JSON.parse(reqProductItems).map((item) => ({
      ListId: createList.id,
      name: item.name,
      amount: item.amount,
      price: item.price,
      totalPrice: item.total_price,
      category: item.category,
    }));
    await ProductItem.bulkCreate(createProductList, { transaction: t });
  };

  try {
    await sequelize.transaction(createListTransaction);
  } catch (error) {
    response = Response.defaultInternalError({ error });
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

  response = Response.defaultOK('New list added successfully', null);
  return res.status(response.code).json(response);
};


// GET All List (Track or Plan)
const getAllListHandler = async (req, res) => {
  const { type } = req.query;
  const { decodedToken } = res.locals;

  if (type === null) {
    response = Response.defaultBadRequest({ message: 'List type is missing.' });
    return res.status(response.code).json(response);
  }

  let trackLists;

  if (type === 'Track') {
    trackLists = await List.findAll({
      where: {
        UserId: decodedToken.id,
        type,
      },
      attributes: ['id', 'title', 'receiptImage', 'thumbnailImage', 'type', 'totalExpenses', 'totalItems'],
    });
  } else if (type === 'Plan') {
    trackLists = await List.findAll({
      where: {
        UserId: decodedToken.id,
        type,
      },
      attributes: ['id', 'title', 'receiptImage', 'thumbnailImage', 'type', 'totalItems'],
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

      const listDTO = allLists();
      const imagePrefix = '../../image_upload/';
      listDTO.id = list.id;
      listDTO.title = list.title;
      listDTO.type = list.type;
      listDTO.total_expenses = list.totalExpenses || null;
      listDTO.total_products = count;
      listDTO.total_items = list.totalItems;

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

  response = Response.defaultOK('List obtained successfully.', { lists });
  return res.status(response.code).json(response);
};

const getListById = async (req, res) => {
  const { listId } = req.params;
  const imagePrefix = '../../image_upload/';
  
  if (listId <= 0) {
    const response = Response.defaultBadRequest(null);
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
    console.error('Error fetching list details:', e);
    const error = new Error(e);
    throw error;
  });

  if (!detailList) {
    const response = Response.defaultNotFound('List not found.');
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

  console.log('This is detail items', detailItems, thumbnail_image, receipt_image);

  const response = Response.defaultOK('List obtained successfully.', { detailItems, thumbnail_image, receipt_image });
  return res.status(response.code).json(response);
};

export {
  createListHandler,
  getAllListHandler,
  getListById,
};
