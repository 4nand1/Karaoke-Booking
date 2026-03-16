import { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karaoke";

export const getKaraoke: RequestHandler = async (_req, res) => {
  console.log("getKaraoke")
  try {
    const karaokes = await KaraokeModel.find({});
    res.status(200).json(karaokes);
  } catch (error) {
    console.error("getKaraoke error:", error);
    res.status(500).json({ message: "Server error" });
  }
};