import { Schema } from "mongoose"

export const ROOM_TYPES = ["VIP", "Medium", "Small"] as const

export interface IRoom {
  name: string
  type: (typeof ROOM_TYPES)[number]
  price: number
  capacity: number
  image: string
  isAvailable: boolean
}

export const roomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  type: { type: String, enum: ROOM_TYPES, required: true },
  price: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
})
