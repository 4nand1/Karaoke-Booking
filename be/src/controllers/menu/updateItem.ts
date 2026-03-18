import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karaoke";

export const updateItem: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;
    const itemId = req.params.itemId as string;
    const body = req.body;

    const karaoke = await KaraokeModel.findById(id);
    if (!karaoke) {
      res.status(404).json({ message: "Karaoke not found" });
      return;
    }

    const item = karaoke.menu.id(itemId);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    Object.assign(item, body);
    await karaoke.save();

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update item" });
  }
};