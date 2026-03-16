import { Schema, Types, model } from "mongoose";
import { IRoom, roomSchema } from "./Room";
import { IMenuItem, menuItemSchema } from "./Menu";

export interface IKaraoke {
  ownerClerkUserId: string
  name: string
  address: string
  city: string
  phone: string
  description: string
  openingTime: string
  closingTime: string
  latitude?: number | null
  longitude?: number | null
  image?: string | null
  createdAt: Date;
  updatedAt: Date;
  rooms: Types.DocumentArray<IRoom>;
   menu: Types.DocumentArray<IMenuItem>
  }[]


const karaokeSchema = new Schema<IKaraoke>(
  {
  ownerClerkUserId: { type: String, required: true, index: true },
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
     menu: [menuItemSchema],
  },
  { timestamps: true }
);

export const KaraokeModel = model("Karaoke", karaokeSchema);
