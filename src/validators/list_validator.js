import Joi from 'joi';
import getError from './error_check.js';

const listValidator = (body) => {
  if (typeof body.product_items === 'string') {
    body.product_items = JSON.parse(body.product_items);
  }

  const productItemsArray = Joi.object({
    name: Joi.string()
      .min(1)
      .required(),
    amount: Joi.number()
      .integer()
      .min(1),
    price: Joi.number()
      .min(0),
    category: Joi.string()
      .min(1),
    total_price: Joi.number()
      .min(0)
  });

  const list = Joi.object({
    title: Joi.string()
      .min(1)
      .required(),
    receipt_image: Joi.string()
      .empty(),
    thumbnail_image: Joi.string()
      .empty(),
    product_items: Joi.array()
      .items(productItemsArray)
      .min(1)
      .required(),
  });

  const error = list.validate(body, { abortEarly: false });
  return getError(error);
};

export default listValidator;
