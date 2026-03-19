import { Schema, model, models } from "mongoose"

export type UserRole = "customer" | "karaoke_owner"
export type OwnerStatus = "pending" | "approved" | null

export interface IUserProfile {
  clerkUserId: string
  email: string
  fullName: string
  role: UserRole
  ownerStatus?: OwnerStatus
  karaokeId?: string | null
  createdAt: Date
  updatedAt: Date
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "karaoke_owner"],
      default: "customer",
    },
    ownerStatus: {
      type: String,
      enum: ["pending", "approved"],
      default: null,
    },
    karaokeId: { type: String, default: null },
  },
  { timestamps: true }
)

export const UserProfile =
  models.UserProfile || model<IUserProfile>("UserProfile", userProfileSchema)