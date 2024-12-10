import Joi from 'joi';
import getError from './error_check.js';

const createShareRequestValidator = (body) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required(),
  });

  const error = schema.validate(body, { abortEarly: false });
  return getError(error);
};

export { createShareRequestValidator };
