import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karoake";

export const createRoom: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const rooms = req.body.rooms;

  const karaoke = await KaraokeModel.findById(id);
  if (!karaoke) {
    res.status(404).json({ message: "Karaoke not found" });
    return;
  }

  karaoke.rooms.push(...rooms);
  await karaoke.save();

  res.status(201).json(karaoke);
};