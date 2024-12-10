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
    amount: Joi.number().integer(),
    price: Joi.number(),
    category: Joi.string(),
    total_price: Joi.number(),
  });

  const list = Joi.object({
    title: Joi.string()
      .min(1)
      .required(),
    type: Joi.string()
      .valid('Track', 'Plan')
      .required(),
    receipt_image: Joi.string()
      .allow(null)
      .empty(''),
    thumbnail_image: Joi.string()
      .allow(null)
      .empty(''),
    total_expenses: Joi.number()
      .empty(''),
    total_items: Joi.number()
      .min(1),
    boughtAt: Joi.date()
      .empty('')
      .optional(),
    product_items: Joi.array()
      .items(productItemsArray)
      .min(1)
      .required(),
  });

  const error = list.validate(body, { abortEarly: false });
  return getError(error);
};

const updateListValidator = (body) => {
  if (typeof body.product_items === 'string') {
    body.product_items = JSON.parse(body.product_items);
  }

  const productItemsArray = Joi.object({
    id: Joi.number()
      .min(1)
      .required(),
    name: Joi.string()
      .min(1)
      .required(),
    amount: Joi.number().integer(),
    price: Joi.number(),
    category: Joi.string(),
    total_price: Joi.number(),
  });

  const list = Joi.object({
    title: Joi.string()
      .min(1)
      .required(),
    type: Joi.string()
      .valid('Track', 'Plan')
      .required(),
    receipt_image: Joi.string()
      .allow(null)
      .empty('')
      .optional(),
    thumbnail_image: Joi.string()
      .allow(null)
      .empty('')
      .optional(),
    total_expenses: Joi.number()
      .empty(''),
    total_items: Joi.number()
      .min(1),
    product_items: Joi.array()
      .items(productItemsArray)
      .min(1)
      .required(),
  });

  const error = list.validate(body, { abortEarly: false });
  return getError(error);
};

export { 
  listValidator,
  updateListValidator,
};

// name: Joi.string()
//   .min(1)
//   .required(),
// amount: Joi.number()
//   .integer()
//   .min(1),
// price: Joi.number()
//   .min(0),
// category: Joi.string()
//   .min(1),
// total_price: Joi.number()
//   .min(0)