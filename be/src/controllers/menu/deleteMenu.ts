import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karoake";

export const deleteMenu: RequestHandler = async (req, res) => {
  const { id } = req.params;
const itemId = req.params.itemId as string;

  const karaoke = await KaraokeModel.findById(id);
  if (!karaoke) {
    res.status(404).json({ message: "Karaoke not found" });
    return;
  }

  const item = karaoke.menu.id(itemId);
  if (!item) {
    res.status(404).json({ message: "Menu item not found" });
    return;
  }

  item.deleteOne();
  await karaoke.save();

  res.status(200).json({ message: "Menu item deleted" });
};