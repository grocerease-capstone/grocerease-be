import express from "express";
import {
  acceptShareRequestHandler,
  createShareRequestHandler,
  getAllShareRequestHandler,
} from "../controllers/index.js";
import { verifyToken } from "../middlewares/jwt.js";

const shareRequestRoutes = express.Router();

/**
 * @swagger
 * /share-request/test:
 *  get:
 *   tags:
 *    - Share Request
 *   summary: Test Share Request routes
 *   responses:
 *    200:
 *     content:
 *      application/json:
 *       schema:
 *        type: string
 */
shareRequestRoutes.get("/test", (req, res) => {
  res.send("Share request routes are connected.");
});

// untuk mendapatkan daftar request yang harus di accept
shareRequestRoutes.get("/", verifyToken, getAllShareRequestHandler);
// untuk accept request yang di share oleh user lain
shareRequestRoutes.get(
  "/:shareRequestId",
  verifyToken,
  acceptShareRequestHandler
);

// untuk membuat share request baru ke user lain
shareRequestRoutes.post("/", verifyToken, createShareRequestHandler);

export default shareRequestRoutes;
