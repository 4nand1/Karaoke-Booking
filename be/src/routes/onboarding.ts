import { Router } from "express"
import { clerkClient } from "@clerk/express"
import { KaraokeModel } from "../models/Karaoke"
import { UserProfile } from "../models/UserProfile"
import { fullName, primaryEmail, requireAuth, syncClerkMetadata, userIdOf } from "../lib/auth"
import { fail, numberOrNull, text, textList } from "../lib/http"

const router = Router()

router.post("/karaoke", requireAuth, async (req, res) => {
  const userId = userIdOf(req)
  const body = req.body ?? {}
  const clerkUser = await clerkClient.users.getUser(userId)

  const images = textList(body.images)
  const openingTime = text(body.openingTime)
  const closingTime = text(body.closingTime)
  const data = {
    name: text(body.karaokeName),
    ownerFullName: text(body.ownerFullName) || fullName(clerkUser, "Owner"),
    email: text(body.email) || primaryEmail(clerkUser),
    phone: text(body.phoneNumber) || text(body.phone),
    address: text(body.address),
    city: text(body.city),
    description: text(body.description),
    openingTime,
    closingTime,
    openingHours: text(body.openingHours) || [openingTime, closingTime].filter(Boolean).join(" - "),
  }

  if (Object.values(data).some((value) => !value)) fail(400, "Missing required fields")

  const karaoke = await KaraokeModel.create({
    ...data,
    ownerClerkUserId: userId,
    amenities: textList(body.amenities),
    images,
    image: images[0] ?? null,
    rulesPolicies: text(body.rulesPolicies),
    approvalStatus: "pending",
    latitude: numberOrNull(body.latitude),
    longitude: numberOrNull(body.longitude),
  })

  await UserProfile.findOneAndUpdate(
    { clerkUserId: userId },
    {
      email: data.email,
      fullName: data.ownerFullName,
      role: "karaoke_owner",
      ownerStatus: "pending",
      karaokeId: String(karaoke._id),
    },
    { upsert: true }
  )
  await syncClerkMetadata(userId, "karaoke_owner", "pending")

  res.status(201).json({ message: "Karaoke registration submitted successfully", karaoke })
})

export default router
