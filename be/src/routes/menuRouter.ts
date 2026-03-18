import { Router } from "express";
import { getItems } from "../controllers/menu/getItem";
import { createItem } from "../controllers/menu/createItem";
import { deleteItem } from "../controllers/menu/deleteItem";
import { updateItem } from "../controllers/menu/updateItem";

const MenuRouter = Router({ mergeParams: true });

MenuRouter.get("/", getItems)
  .post("/", createItem)
  .delete("/:itemId", deleteItem)
  .put("/:itemId", updateItem);

export { MenuRouter };