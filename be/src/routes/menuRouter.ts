import { Router } from "express";
import { getItems } from "../controllers/menu/getItem";
import { createItem } from "../controllers/menu/createItem";
import { deleteItem } from "../controllers/menu/deleteItem";
import { updateItem } from "../controllers/menu/updateItem";
import { requireKaraokeAdmin } from "../middlewares/authMidlleware";

const MenuRouter = Router({ mergeParams: true });

MenuRouter.get("/", getItems)
  .post("/", requireKaraokeAdmin, createItem)
  .delete("/:itemId", requireKaraokeAdmin, deleteItem)
  .put("/:itemId", requireKaraokeAdmin, updateItem);

export { MenuRouter };
