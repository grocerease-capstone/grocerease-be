import Joi from 'joi';
import getError from './error_check.js';

const userUpdateValidator = (body) => {
  const userUpdate = Joi.object({
    username: Joi.string()
      .min(4)
      .required(),
    password: Joi.string()
      .min(8)
      .allow('')
      .optional(),
    new_password: Joi.string()
      .when('password', {
        is: Joi.string().min(8),
        then: Joi.string().min(8).required().invalid(Joi.ref('password')),
        otherwise: Joi.forbidden().allow('').optional(),
      }).messages({
        'any.invalid': 'New password must not be the same as the current password',
      }),
    profile_image: Joi.string()
      .empty('')
      .optional(),
  });

  const error = userUpdate.validate(body, { abortEarly: false });
  return getError(error);
};

export { userUpdateValidator };