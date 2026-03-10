import { Schema, model } from "mongoose";

const karaokeSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  { timestamps: true },
);

export const KaraokeModel = model("Karaoke", karaokeSchema);
