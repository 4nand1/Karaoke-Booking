import { Schema, Types, model, models } from "mongoose";
import { IRoom, roomSchema } from "./Room";

export interface IKaraoke {
  ownerClerkUserId: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  openingTime: string;
  closingTime: string;
  latitude?: number | null;
  longitude?: number | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  rooms: Types.DocumentArray<IRoom>;
}

const karaokeSchema = new Schema<IKaraoke>(
  {
    ownerClerkUserId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String, required: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    image: { type: String, default: null },
    rooms: [roomSchema],
  },
  { timestamps: true }
);

export const KaraokeModel =
  models.Karaoke || model<IKaraoke>("Karaoke", karaokeSchema);