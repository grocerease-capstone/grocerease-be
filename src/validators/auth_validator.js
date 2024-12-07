import Joi from 'joi';
import getError from './error_check.js';

const registerValidator = (body) => {
  console.log('Body received for validation:', body);
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
    passwordRepeat: Joi.valid(Joi.ref('password')).required()
      .messages({ 'any.only': 'Passwords must match' }),
  });

  const error = userRegister.validate(body, { abortEarly: false });
  console.log('this is the erros: ', error);
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