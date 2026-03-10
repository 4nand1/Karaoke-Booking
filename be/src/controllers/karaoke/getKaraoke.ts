import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karoake";

export const getKaraoke: RequestHandler = async (_req, res) => {
  const karaoke = await KaraokeModel.find({});
  res.status(200).json(karaoke);
};
