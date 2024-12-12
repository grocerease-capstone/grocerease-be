/* eslint-disable camelcase */
// import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { sequelize } from '../models/definitions.js';
import {
  User,
  List,
  ProductItem,
  UserList,
} from '../models/index.js';
import { convertFileName } from '../utils/index.js';
import { listValidator, updateListValidator } from '../validators/index.js';
import Response from '../dto/response.js';
import { uploadFileToStorage, deleteFromStorage } from '../config/index.js';

let response;
const imagePrefix = '../../image_upload/';
const default_receipt = 'default_images/default_noreceipt.jpg';

// POST List (Track or Plan)
const createListHandler = async (req, res) => {
  try {
    const reqBody = req.body;
    const reqFiles = req.files;
    const reqProductItems = reqBody.product_items;
  
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

    await sequelize.transaction(createListTransaction);
  
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
  
    response = Response.defaultCreated('New list added successfully.', null);
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError('Failed to create list.', { e });
    return res.status(response.code).json(response);
  }
};

// GET All List (Track or Plan)
const getAllListHandler = async (req, res) => {
  try {
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
  } catch (e) {
    response = Response.defaultInternalError('Failed to fetch list.', { e });
    return res.status(response.code).json(response);
  }
};

const getAllListByDateHandler = async (req, res) => {
  try {
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
  } catch (e) {
    response = Response.defaultInternalError('Failed to fetch list.', { e });
    return res.status(response.code).json(response);
  }
};

const getAllSharedListHandler = async (req, res) => {
  try {
    const { type } = req.query;
    const { decodedToken } = res.locals;

    if (type === null) {
      response = Response.defaultBadRequest({ message: 'List type is missing.' });
      return res.status(response.code).json(response);
    }

    const sharedLists = await UserList.findAll({
      where: { InvitedId: decodedToken.id },
      attributes: ['id', 'ListId'],
    });

    if (!sharedLists || sharedLists.length === 0) {
      response = Response.defaultOK('No lists found for this user');
      return res.status(response.code).json(response);
    }

    const allSharedLists = await Promise.all(
      sharedLists.map(async (sharedList) => {
        const detailLists = await List.findAll({
          where: {
            id: sharedList.ListId,
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
            'UserId',
          ],
          order: [['boughtAt', 'DESC']],
        });

        return detailLists[0];
      }),
    );

    const allDetailList = await Promise.all(
      allSharedLists.map(async (list) => {
        const { count } = await ProductItem.findAndCountAll({
          where: {
            ListId: list.id,
          },
        });

        const ownerName = await User.findOne({
          where: {
            id: list.UserId,
          },
          attributes: ['username'],
        });

        const listDTO = {};
        listDTO.id = list.id;
        listDTO.title = list.title;
        listDTO.type = list.type;
        listDTO.total_expenses = list.totalExpenses || null;
        listDTO.total_products = count;
        listDTO.total_items = list.totalItems;
        listDTO.boughtAt = list.boughtAt;
        listDTO.sender = ownerName.username;

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
      { allDetailList },
    );
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError('Failed to fetch shared list.', { e });
    return res.status(response.code).json(response);
  }
};

const getListById = async (req, res) => {
  try {
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
  } catch (e) {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  }
};

const updateListHandler = async (req, res) => {
  try {
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
    await sequelize.transaction(async (t) => {
      await List.update({
        title: reqBody.title,
        totalExpenses: reqBody.total_expenses,
        totalItems: reqBody.total_items,
        updatedAt: new Date(),
      },
      { where: { id: listId }, transaction: t });

      for (const { id, name, amount, price, total_price, category } of reqBody.product_items) {
        await ProductItem.update({
          name,
          amount,
          price,
          totalPrice: total_price,
          category,
        }, { where: { id }, transaction: t });
      }
    });

    response = Response.defaultCreated('List updated successfully.');
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  }


};

const deleteListHandler = async (req, res) => {
  try {
    const { listId } = req.params;

    const list = await List.findOne({
      where: { id: listId },
      attributes: ['receiptImage', 'thumbnailImage'],
    });

    if (list.receiptImage) {
      deleteFromStorage(process.env.GC_STORAGE_BUCKET, list.receiptImage);
    }

    if (list.thumbnailImage) {
      deleteFromStorage(process.env.GC_STORAGE_BUCKET, list.thumbnailImage);
    }

    await List.destroy({
      where: {
        id: listId,
      },
    });

    response = Response.defaultOK('List deleted successfully.', null);
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError({ e });
    return res.status(response.code).json(response);
  }
};

export {
  createListHandler,
  getAllListHandler,
  getListById,
  updateListHandler,
  deleteListHandler,
  getAllListByDateHandler,
  getAllSharedListHandler
};
