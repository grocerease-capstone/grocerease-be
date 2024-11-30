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

  // todo: masih dalam bentuk string, sehingga harus diparse ke array
  const reqProductItems = reqBody.productItems;

  const reqError = listValidator(reqBody);
  if (reqError.length !== 0) {
    response = Response.defaultBadRequest({ errors: reqError });
    // const reqProductItems = reqBody.product_items;
    return res.status(response.code).json(response);
  }

  const receiptImageFile = reqFiles.receipt_image[0]; // First file for 'receipt_image'
  // const thumbnailImageFile = reqFiles.thumbnail_image ? reqFiles.thumbnail_image[0] : null;

  // const reqProductItems = reqBody.product_items;
  // if (!Array.isArray(reqProductItems) || reqProductItems.length === 0) {
  //   console.log('reqProductItems now', reqProductItems)
  //   response = Response.defaultBadRequest({ errors: 'Product items must be an array.' });
  //   return res.status(response.code).json(response);
  // }

  console.log("This is image22", receiptImageFile.originalname);
  const receiptImageName = convertFileName(
    "receipt_images/",
    receiptImageFile.originalname
  );
  let thumbnailImageName = null;

  if (
    reqFiles.thumbnail_image &&
    typeof reqFiles.thumbnail_image === "object"
  ) {
    thumbnailImageName = convertFileName(
      "thumbnails/",
      reqFiles.thumbnail_image[0].originalname
    );
  }

  // const listId = uuidv4();
  const { decodedToken } = res.locals;

  try {
    const result = await sequelize.transaction(async (t) => {
      // get authenticated user
      const authenticatedUser = await User.findOne({
        where: { id: decodedToken.id },
      });

      // insert list
      const insertListResult = await List.create({
        id: uuidv4(),
        title: reqBody.title,
        receiptImage: "",
        thumbnailImage: "",
        UserId: authenticatedUser.id,
      });

      // insert product items
      // todo: sebelumnya, karena masih dalam bentuk string (bukan array) jadi error ketika di mapping. alhasil tidak bisa bulkCreate
      const productItems = JSON.parse(reqProductItems).map((item) => ({
        id: uuidv4(),
        name: item.name,
        amount: item.amount,
        price: item.price,
        totalPrice: item.total_price,
        category: item.category,
        ListId: insertListResult.id,
      }));
      const insertProductItemsResult = await ProductItem.bulkCreate(
        productItems
      );
    });
  } catch (e) {
    console.log(e);
  }

  // console.log("This is ListID: ", listId, "and this is uuidv4: ", uuidv4());
  // // console.log(user.id);
  // const createListTransaction = async (t) => {
  //   const user = await User.findOne(
  //     {
  //       where: {
  //         id: decodedToken.id,
  //       },
  //     },
  //     { transaction: t }
  //   );
  //   console.log(
  //     "this is the listId: ",
  //     listId,
  //     "\nthis is the title: ",
  //     reqBody.title,
  //     "\nthis is the receiptImage: ",
  //     receiptImageName,
  //     "\nthis is thumbnailImage: ",
  //     thumbnailImageName,
  //     "\nthis is userId: ",
  //     user.id
  //   );
  //   const response = await List.create(
  //     {
  //       id: listId,
  //       title: reqBody.title,
  //       receiptImage: receiptImageName,
  //       thumbnailImage: thumbnailImageName === null ? null : thumbnailImageName,
  //       UserId: decodedToken.id,
  //     },
  //     { transaction: t }
  //   );
  //   console.log({ response });
  //   console.log("this reach here!!");
  //   const createProductList = reqProductItems.map((item) => ({
  //     id: uuidv4(),
  //     ListId: listId,
  //     name: item.name,
  //     amount: item.amount,
  //     price: item.price,
  //     totalPrice: item.total_price,
  //     category: item.category,
  //   }));

  //   console.log({ createProductList });

  //   await ProductItem.bulkCreate(createProductList, { transaction: t });

  //   console.log("this reach here22");
  //   //console.log('it reaches here')
  // };

  // const createProductList = async (t) => {
  //   console.log('this reach here22')
  //   await ProductItem.bulkCreate(reqProductItems.map((item) => ({
  //     id: uuidv4(),
  //     ListId: listId,
  //     name: item.name,
  //     amount: item.amount,
  //     price: item.price,
  //     totalPrice: item.total_price,
  //     category: item.category,
  //   })), { transaction: t });
  //   console.log('this reach here333')
  // };

  // try {
  //   await sequelize.transaction(createListTransaction);
  //   // await sequelize.transaction(createProductList);
  // } catch (error) {
  //   console.log("upload failed");
  //   response = Response.defaultInternalError({ error });
  //   return res.status(response.code).json(response); // Stop execution here
  // }

  // const result = await sequelize.transaction(createListTransaction).catch((error) => error);
  // if (result instanceof Error) {
  //   const errorMessage = result.errors?.[0]?.message;
  //   console.log('test error: ', errorMessage);
  //   response = Response.defaultConflict({ error: errorMessage });
  //   return res.status(response.code).json(response);
  // }

  // await uploadFileToStorage(process.env.BUCKET_NAME, receiptName, reqFiles.mam_image[0].buffer);
  // if (thumbnailImageName) {
  //   await uploadFileToStorage(process.env.BUCKET_NAME, thumbnailImageName, reqFiles.image[0].buffer);
  // }

  // await uploadFileToStorage(
  //   "../../image_upload",
  //   receiptImageName,
  //   reqFiles.receipt_image[0].buffer
  // );
  // if (thumbnailImageName) {
  //   await uploadFileToStorage(
  //     "../../image_upload",
  //     thumbnailImageName,
  //     reqFiles.thumbnail_image[0].buffer
  //   );
  // }

  response = Response.defaultOK("New list added successfully", null);
  return res.status(response.code).json(response);
};

export { createListHandler };
