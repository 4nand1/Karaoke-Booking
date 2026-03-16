import { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karaoke";

export const deleteKaraoke: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const karaoke = await KaraokeModel.findByIdAndDelete(req.params.id);
  res.status(201).json(karaoke);
};
