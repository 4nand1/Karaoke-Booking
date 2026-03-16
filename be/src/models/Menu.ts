import { Schema } from "mongoose";

export interface IMenuItem {
  name: string
  category: "food" | "drink" | "set"
  price: number
  description?: string
  image?: string
  isAvailable: boolean
}

export const menuItemSchema = new Schema<IMenuItem>({
  name: { type: String, required: true },
  category: { type: String, enum: ["food", "drink", "set"], required: true },
  price: { type: Number, required: true },
  description: { type: String, default: null },
  image: { type: String, default: null },
  isAvailable: { type: Boolean, default: true },
})