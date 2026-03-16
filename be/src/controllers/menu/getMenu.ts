import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karoake";

export const getMenu: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const karaoke = await KaraokeModel.findById(id);
  if (!karaoke) {
    res.status(404).json({ message: "Karaoke not found" });
    return;
  }

  res.status(200).json(karaoke.menu);
};