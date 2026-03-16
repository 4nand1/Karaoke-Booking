import { RequestHandler } from "express";
import { ItemModel } from "../../models/MenuItem";

export const updateItem: RequestHandler = async (req, res) => {
  const { _id } = req.params;
  const body = req.body;

  console.log(body);

  const item = await ItemModel.findByIdAndUpdate(_id, body, { new: true });

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.status(200).json(item);
};
