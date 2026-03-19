import { Router } from "express"
import { clerkClient, getAuth } from "@clerk/express"
import { UserProfile } from "../models/UserProfile"
import { KaraokeModel } from "../models/Karaoke"

const router = Router()

router.post("/karaoke", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req)

    if (!isAuthenticated || !userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    console.log("POST /karaoke userId:", userId)
    console.log("POST /karaoke body:", req.body)

    const clerkUser = await clerkClient.users.getUser(userId)

    const clerkEmail =
      clerkUser.emailAddresses.find(
        (item) => item.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || ""

    const clerkFullName =
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Owner"

    const {
      karaokeName,
      ownerFullName,
      phoneNumber,
      phone,
      email,
      address,
      city,
      description,
      openingHours,
      openingTime,
      closingTime,
      amenities,
      images,
      rulesPolicies,
      latitude,
      longitude,
    } = req.body as {
      karaokeName?: string
      ownerFullName?: string
      phoneNumber?: string
      phone?: string
      email?: string
      address?: string
      city?: string
      description?: string
      openingHours?: string
      openingTime?: string
      closingTime?: string
      amenities?: string[]
      images?: string[]
      rulesPolicies?: string
      latitude?: number | null
      longitude?: number | null
    }

    const resolvedPhone = phoneNumber || phone || ""
    const resolvedOwnerFullName = ownerFullName || clerkFullName
    const resolvedEmail = email || clerkEmail
    const resolvedOpeningHours =
      openingHours || [openingTime, closingTime].filter(Boolean).join(" - ")

    if (
      !karaokeName ||
      !resolvedOwnerFullName ||
      !resolvedPhone ||
      !resolvedEmail ||
      !address ||
      !city ||
      !description ||
      !openingTime ||
      !closingTime
    ) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const existing = await KaraokeModel.findOne({ ownerClerkUserId: userId })
    if (existing) {
      return res.status(409).json({ message: "Karaoke already registered" })
    }

    const karaoke = await KaraokeModel.create({
      ownerClerkUserId: userId,
      ownerFullName: resolvedOwnerFullName,
      email: resolvedEmail,
      name: karaokeName,
      address,
      city,
      phone: resolvedPhone,
      description,
      openingHours: resolvedOpeningHours,
      openingTime,
      closingTime,
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
      rulesPolicies: rulesPolicies ?? "",
      approvalStatus: "pending",
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      image: Array.isArray(images) && images.length > 0 ? images[0] : null,
    })

    await UserProfile.findOneAndUpdate(
      { clerkUserId: userId },
      {
        clerkUserId: userId,
        email: resolvedEmail,
        fullName: resolvedOwnerFullName,
        role: "karaoke_owner",
        ownerStatus: "pending",
        karaokeId: String(karaoke._id),
      },
      { upsert: true, new: true }
    )

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "karaoke_owner",
        ownerStatus: "pending",
      },
    })

    return res.status(201).json({
      message: "Karaoke registration submitted successfully",
      karaoke,
    })
  } catch (error) {
    console.error("POST /karaoke onboarding failed:", error)

    const message =
      error instanceof Error ? error.message : "Unknown server error"

    return res.status(500).json({
      message: "Server error",
      error: message,
    })
  }
})

export default router