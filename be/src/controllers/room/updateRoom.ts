import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karoake";

export const updateRoom: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const roomId = req.params.roomId as string;
  const body = req.body;

  const karaoke = await KaraokeModel.findById(id);
  if (!karaoke) {
    res.status(404).json({ message: "Karaoke not found" });
    return;
  }

  const room = karaoke.rooms.id(roomId);
  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }

  Object.assign(room, body);
  await karaoke.save();

  res.status(200).json(room);
};