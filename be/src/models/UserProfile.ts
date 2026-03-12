import { Schema, model, models } from "mongoose"

export type UserRole = "user" | "admin"

export interface IUserProfile {
  clerkUserId: string
  email: string
  fullName: string
  role: UserRole
  karaokeId?: string | null
  createdAt: Date
  updatedAt: Date
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    karaokeId: { type: String, default: null },
  },
  { timestamps: true }
)

export const UserProfile =
  models.UserProfile || model<IUserProfile>("UserProfile", userProfileSchema)