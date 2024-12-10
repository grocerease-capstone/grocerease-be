import Joi from "joi";
import getError from "./error_check.js";

const createShareRequestValidator = (body) => {
  const schema = Joi.object({
    invited_id: Joi.string().required(),
    list_id: Joi.number().required(),
  });

  const error = schema.validate(body, { abortEarly: false });
  return getError(error);
};

export { createShareRequestValidator };
