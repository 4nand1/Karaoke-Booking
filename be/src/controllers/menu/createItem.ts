import type { RequestHandler } from "express";
import { ItemModel } from "../../models/MenuItem";

export const createItem: RequestHandler = async (req, res) => {
  const body = req.body;

  const item = await ItemModel.create({
    name: body.name,
    price: body.price,
    categoryId: body.categoryId,
  });
  res.status(201).json(item);
};
