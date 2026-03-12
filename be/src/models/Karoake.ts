import { Schema, model, models } from "mongoose"

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
  createdAt: Date
  updatedAt: Date
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
  },
  { timestamps: true }
)

export const Karaoke =
  models.Karaoke || model<IKaraoke>("Karaoke", karaokeSchema)