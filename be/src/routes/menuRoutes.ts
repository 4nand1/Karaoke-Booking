import { Router } from "express";
import { createMenu } from "../controllers/menu/createMenu";
import { getMenu } from "../controllers/menu/getMenu";
import { updateMenu } from "../controllers/menu/updateMenu";
import { deleteMenu } from "../controllers/menu/deleteMenu";

const MenuRouter = Router({ mergeParams: true });

MenuRouter.get("/", getMenu);
MenuRouter.post("/", createMenu);
MenuRouter.put("/:itemId", updateMenu);
MenuRouter.delete("/:itemId", deleteMenu);

export { MenuRouter };