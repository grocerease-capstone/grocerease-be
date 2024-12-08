import Joi from 'joi';
import getError from './error_check.js';

const registerValidator = (body) => {
  const userRegister = Joi.object({
    username: Joi.string()
      .min(4)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(8)
      .required(),
    password_repeat: Joi.valid(Joi.ref('password')).required()
      .messages({ 'any.only': 'Passwords must match' }),
    profile_image: Joi.string()
      .empty('')
      .optional(),
  });

  const error = userRegister.validate(body, { abortEarly: false });
  return getError(error);
};

const loginValidator = (body) => {
  const userLogin = Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(8)
      .required()
  });

  const error = userLogin.validate(body, { abortEarly: false });
  return getError(error);
};

export {
  registerValidator,
  loginValidator
};