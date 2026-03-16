import { RequestHandler } from "express";
import { ItemModel } from "../../models/MenuItem";

export const deleteItem: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const item = await ItemModel.findByIdAndDelete(req.params.id);
  res.status(201).json(item);
};
