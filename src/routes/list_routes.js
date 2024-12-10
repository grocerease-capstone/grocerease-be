import express from "express";
import {
  createListHandler,
  deleteListHandler,
  getAllListByDateHandler,
  getAllListHandler,
  getListById,
  shareListHandler,
  updateListHandler,
} from "../controllers/index.js";
import { imageUploads } from "../middlewares/index.js";
import { verifyToken } from "../middlewares/jwt.js";

const listRoutes = express.Router();

listRoutes.get("/test", (req, res) => {
  res.send("List routes are connected.");
});
listRoutes.get("/", verifyToken, getAllListHandler);
listRoutes.get("/filter", verifyToken, getAllListByDateHandler);
listRoutes.get("/:listId", verifyToken, getListById);

listRoutes.post("/", verifyToken, imageUploads, createListHandler);
listRoutes.post("/:listId", verifyToken, shareListHandler);
// listRoutes.post("/", verifyToken, acceptListHandler);

listRoutes.put("/:listId", verifyToken, imageUploads, updateListHandler);

listRoutes.delete("/:listId", verifyToken, deleteListHandler);

export default listRoutes;
