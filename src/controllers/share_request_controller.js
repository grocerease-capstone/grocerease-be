import Response from "../dto/response.js";
import { ShareRequests } from "../models/index.js";
import { createShareRequestValidator } from "../validators/index.js";

let response;

const createShareRequestHandler = async (req, res) => {
  const { invited_id, list_id } = req.body;

  const reqError = createShareRequestValidator({ invited_id, list_id });
  if (reqError.length !== 0) {
    response = Response.defaultBadRequest({ errors: reqError });
    return res.status(response.code).json(response);
  }

  try {
    await ShareRequests.create({
      invitedId: invited_id,
      listId: list_id,
    });

    response = Response.defaultCreated(
      "Share request created successfully.",
      null
    );
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError(
      "Failed to create share request.",
      e.message
    );
    return res.status(response.code).json(response);
  }
};

const getAllShareRequestHandler = async (req, res) => {
  const { decodedToken } = res.locals;
  const authenticatedUserId = decodedToken.id;
};

const acceptShareRequestHandler = async (req, res) => {};

export {
  acceptShareRequestHandler,
  createShareRequestHandler,
  getAllShareRequestHandler,
};
