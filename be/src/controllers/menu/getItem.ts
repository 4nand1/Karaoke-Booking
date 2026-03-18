import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karaoke";

export const getItems: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const karaoke = await KaraokeModel.findById(id);
    if (!karaoke) {
      res.status(404).json({ message: "Karaoke not found" });
      return;
    }
    res.status(200).json(karaoke.menu);
  } catch (error) {
    res.status(500).json({ message: "Failed to get menu" });
  }
};