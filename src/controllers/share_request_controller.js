import { sequelize } from '../models/definitions.js';
import Response from '../dto/response.js';
import { ShareRequests, User, UserList, List } from '../models/index.js';
import { createShareRequestValidator } from '../validators/index.js';
import { shareRequests } from '../models/instances.js';

let response;

const createShareRequestHandler = async (req, res) => {
  try {
    const { listId } = req.params;
    const reqBody = req.body;

    const reqError = createShareRequestValidator(reqBody);
    if (reqError.length !== 0) {
      response = Response.defaultBadRequest({ errors: reqError });
      return res.status(response.code).json(response);
    }

    const invitedEmail = await User.findOne({
      where: {
        email: reqBody.email,
      },
      attributes: ['id'],
    });
  
    if (!invitedEmail) {
      response = Response.defaultNotFound('Email not found.');
      return res.status(response.code).json(response);
    }

    await ShareRequests.create({
      InvitedId: invitedEmail.id,
      ListId: listId,
    });

    response = Response.defaultCreated('Share request created successfully.', null);
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError('Failed to create share request.', { e });
    return res.status(response.code).json(response);
  }
};

const getAllShareRequestHandler = async (req, res) => {
  try {
    const { decodedToken } = res.locals;

    const requests = await ShareRequests.findAll({
      where: {
        InvitedId: decodedToken.id,
      },
      attributes: ['id', 'InvitedId', 'ListId'],
    });

    const requestDetail = await Promise.all(
      requests.map(async (request) => {
        const list = await List.findOne({
          where: {
            id: request.ListId,
          },
          attributes: ['title'],
          include: [{
            model: User,
            attributes: ['username'],
          }],
        });

        const listRequestDTO = {};
        listRequestDTO.id = request.id;
        listRequestDTO.title = list.title;
        listRequestDTO.username = list.User.username;

        console.log(request.id);

        return listRequestDTO;
      })
    );

    response = Response.defaultOK('Notifications obtained successfully', { requestDetail });
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError('Failed to fetch share requests.', { e });
    return res.status(response.code).json(response);
  }
};

const acceptShareRequestHandler = async (req, res) => {
  try {
    const { shareRequestId } = req.params;
    const { decodedToken } = res.locals;
    const authenticatedUserId = decodedToken.id;

    const shareRequest = await ShareRequests.findOne({
      attributes: ['id', 'InvitedId', 'ListId'],
      where: {
        id: shareRequestId,
        InvitedId: authenticatedUserId,
      },
    });

    if (!shareRequest) {
      response = Response.defaultNotFound('Share request not found.');
      return res.status(response.code).json(response);
    }

    await sequelize.transaction(async (t) => {
      await UserList.create({
        InvitedId: shareRequest.InvitedId,
        ListId: shareRequest.ListId,
      }, { transaction: t });
      await shareRequest.destroy({ transaction: t });
    });

    response = Response.defaultOK('Share request accepted.');
    return res.status(response.code).json(response);
  } catch (e) {
    console.log(e);
    response = Response.defaultInternalError(
      'Something went wrong while accepting the share request.',
      e.message
    );
    return res.status(response.code).json(response);
  }
};

const rejectShareRequestHandler = async (req, res) => {
  const { shareRequestId } = req.params;

  const shareRequest = await ShareRequests.findOne({
    where: { id: shareRequestId },
  });

  if (!shareRequest) {
    response = Response.defaultNotFound('Share request not found.');
    return res.status(response.code).json(response);
  }

  await ShareRequests.destroy({
    where: { id: shareRequestId },
  });

  response = Response.defaultOK('Request rejected.', null);
  return res.status(response.code).json(response);
};

export {
  acceptShareRequestHandler,
  createShareRequestHandler,
  getAllShareRequestHandler,
  rejectShareRequestHandler
};
