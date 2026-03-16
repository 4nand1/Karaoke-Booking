import type { RequestHandler } from "express";
import { ItemModel } from "../../models/MenuItem";

export const getItems: RequestHandler = async (_req, res) => {
  const items = await ItemModel.find({}).populate("categoryId");
  res.status(200).json(items);
};
