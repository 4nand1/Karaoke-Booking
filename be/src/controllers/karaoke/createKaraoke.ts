import type { RequestHandler } from "express";
import { KaraokeModel } from "../../models/Karoake";

export const createKaraoke: RequestHandler = async (req, res) => {
  const body = req.body;

  const karaoke = await KaraokeModel.create({
    name: body.name,
    price: body.price,
    image: body.image,
    location: body.location,
    phoneNumber: body.phoneNumber,
  });
  res.status(201).json(karaoke);
};
