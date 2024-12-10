import { QueryTypes } from "sequelize";
import sequelize from "../config/orm.js";
import Response from "../dto/response.js";
import { ShareRequests, UserList } from "../models/index.js";
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
    console.log(e); // error: data too long for column invited id??
    response = Response.defaultInternalError(
      "Failed to create share request.",
      e.message
    );
    return res.status(response.code).json(response);
  }
};

const getAllShareRequestHandler = async (req, res) => {
  try {
    const { decodedToken } = res.locals;
    const authenticatedUserId = decodedToken.id;

    const requests = await sequelize.query(
      `
        select 
          sr.id, 
          u.username, 
          l.title
        from share_requests sr
        join USER u on u.id = sr.invitedid
        join LIST l on l.id = sr.listid
        where sr.invitedid = :invitedId
      `,
      {
        replacements: { invitedId: authenticatedUserId },
        type: QueryTypes.SELECT,
      }
    );

    response = Response.defaultOK(authenticatedUserId);
    return res.status(response.code).json(requests);
  } catch (e) {
    response = Response.defaultInternalError(
      "Failed to fetch share requests.",
      e.message
    );
    return res.status(response.code).json(response);
  }
};

const acceptShareRequestHandler = async (req, res) => {
  try {
    const { shareRequestId } = req.params;
    const { decodedToken } = res.locals;
    const authenticatedUserId = decodedToken.id;

    // cari share request berdasarkan id dan invitedId
    const shareRequest = await ShareRequests.findOne({
      attributes: ["invitedId", "listId"],
      where: {
        id: shareRequestId,
        invitedId: authenticatedUserId,
      },
    });

    // jika tidak ada, kembalikan response 404
    if (!shareRequest) {
      response = Response.defaultNotFound("Share request not found.");
      return res.status(response.code).json(response);
    }

    // jika ada, lakukan transaksi untuk menghapus share request dan menambahkan ke user list
    await sequelize.transaction(async (t) => {
      await UserList.create({
        invitedId: shareRequest.invitedId,
        listId: shareRequest.listId,
      });
      await shareRequest.destroy({ transaction: t });
    });

    response = Response.defaultOK("Share request accepted.");
    return res.status(response.code).json(response);
  } catch (e) {
    response = Response.defaultInternalError(
      "Something went wrong while accepting the share request.",
      e.message
    );
    return res.status(response.code).json(response);
  }
};

export {
  acceptShareRequestHandler,
  createShareRequestHandler,
  getAllShareRequestHandler,
};
