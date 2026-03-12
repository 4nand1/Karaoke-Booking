import { Schema, model } from "mongoose";
import { roomSchema } from "./Room";

const karaokeSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    rooms: [roomSchema],
  },
  { timestamps: true },
);

export const KaraokeModel = model("Karaoke", karaokeSchema);