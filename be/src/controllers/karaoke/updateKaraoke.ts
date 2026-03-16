import { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karaoke";

export const updateKaraoke: RequestHandler = async (req, res) => {
  const { _id } = req.params;
  const body = req.body;

  const karaoke = await KaraokeModel.findByIdAndUpdate(_id, body, {
    new: true,
  });

  if (!karaoke) {
    return res.status(404).json({ message: "Karaoke not found" });
  }

  res.status(200).json(karaoke);
};
