import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karoake";

export const deleteRoom: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const roomId = req.params.roomId as string;

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

  room.deleteOne();
  await karaoke.save();

  res.status(200).json({ message: "Room deleted" });
};