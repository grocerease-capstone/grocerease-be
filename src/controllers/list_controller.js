/* eslint-disable camelcase */
import { v4 as uuidv4 } from "uuid";
import Response from "../dto/response.js";
import { List, ProductItem, sequelize } from "../models/definitions.js";
import { User } from "../models/index.js";
import { convertFileName } from "../utils/file_process.js";
import { listValidator } from "../validators/index.js";

let response;

const createListHandler = async (req, res) => {
  const reqBody = req.body;
  const reqFiles = req.files;
  const reqProductItems = reqBody.product_items;

  const reqError = listValidator(reqBody);
  if (reqError.length !== 0) {
    response = Response.defaultBadRequest({ errors: reqError });
    return res.status(response.code).json(response);
  }

  const receiptImageName = convertFileName("receipt_images/", reqFiles.receipt_image[0].originalname);

  let thumbnailImageName;
  if (reqFiles.thumbnail_image && typeof reqFiles.thumbnail_image === "object") {
    thumbnailImageName = convertFileName("thumbnails/", reqFiles.thumbnail_image[0].originalname);
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
      receiptImage: receiptImageName,
      thumbnailImage: thumbnailImageName,
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
  await uploadFileToStorage("../../image_upload", receiptImageName, reqFiles.receipt_image[0].buffer);
  if (thumbnailImageName) {
    await uploadFileToStorage("../../image_upload", thumbnailImageName, reqFiles.thumbnail_image[0].buffer);
  }

  response = Response.defaultOK("New list added successfully", null);
  return res.status(response.code).json(response);
};

export { createListHandler };
