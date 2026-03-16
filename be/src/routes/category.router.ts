import { Router } from "express";
import { getCategories } from "../controllers/category/getCategory";
import { createCategory } from "../controllers/category/createCategory";

const CategoryRouter = Router();

CategoryRouter.get("/", getCategories).post("/create", createCategory);

export { CategoryRouter };
