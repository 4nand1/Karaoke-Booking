
import { Schema, model } from "mongoose";


export const roomSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["VIP", "Medium", "Small"], required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  image: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
});

export const RoomModel = model("Room", roomSchema);