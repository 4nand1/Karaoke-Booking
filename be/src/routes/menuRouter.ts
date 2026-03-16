import { Router } from "express";
import { getItems } from "../controllers/menu/getItem";
import { createItem } from "../controllers/menu/createItem";
import { deleteItem } from "../controllers/menu/deleteItem";
import { updateItem } from "../controllers/menu/updateItem";

const ItemRouter = Router();

ItemRouter.get("/", getItems)
  .post("/create", createItem)
  .delete("/:id", deleteItem)
  .put("/:_id", updateItem);

export { ItemRouter };
