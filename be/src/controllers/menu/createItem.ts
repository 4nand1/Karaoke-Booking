import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karaoke";

export const createItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const items = req.body.items;

    const karaoke = await KaraokeModel.findById(id);
    if (!karaoke) {
      res.status(404).json({ message: "Karaoke not found" });
      return;
    }

    karaoke.menu.push(...items);
    await karaoke.save();

    res.status(201).json(karaoke.menu);
  } catch (error) {
    res.status(500).json({ message: "Failed to add menu items" });
  }
};