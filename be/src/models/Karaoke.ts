import { Schema, Types, model, models } from "mongoose"
import { IRoom, roomSchema } from "./Room"
import { IMenuItem, menuItemSchema } from "./MenuItem"

export type KaraokeApprovalStatus = "pending" | "approved" | "rejected" | "draft"

export interface IKaraoke {
  ownerClerkUserId: string
  ownerFullName?: string
  email?: string
  name: string
  address: string
  city: string
  phone: string
  description: string
  openingHours?: string
  openingTime: string
  closingTime: string
  roomTypes?: string[]
  pricePerHour?: number | null
  capacity?: number | null
  amenities?: string[]
  images?: string[]
  rulesPolicies?: string
  approvalStatus?: KaraokeApprovalStatus
  latitude?: number | null
  longitude?: number | null
  image?: string | null
  rating?: number | null
  createdAt: Date
  updatedAt: Date
  rooms: Types.DocumentArray<IRoom>
  menu: Types.DocumentArray<IMenuItem>
}

const karaokeSchema = new Schema<IKaraoke>(
  {
    ownerClerkUserId: { type: String, required: true, index: true },
    ownerFullName: { type: String, default: "" },
    email: { type: String, default: "" },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String, required: true },
    openingHours: { type: String, default: "" },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    roomTypes: [{ type: String }],
    pricePerHour: { type: Number, default: null },
    capacity: { type: Number, default: null },
    amenities: [{ type: String }],
    images: [{ type: String }],
    rulesPolicies: { type: String, default: "" },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "draft"],
      default: "pending",
      index: true,
    },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    image: { type: String, default: null },
    rating: { type: Number, default: null },
    rooms: [roomSchema],
    menu: [menuItemSchema],
  },
  { timestamps: true }
)

export const KaraokeModel =
  models.Karaoke || model<IKaraoke>("Karaoke", karaokeSchema)

export const Karaoke = KaraokeModel