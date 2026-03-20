import { Router } from "express"
import { clerkClient, getAuth } from "@clerk/express"
import { UserProfile } from "../models/UserProfile"
import { KaraokeModel } from "../models/Karaoke"

const router = Router()

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
}

function normalizeCoordinate(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

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

    const normalizedKaraokeName = normalizeText(karaokeName)
    const normalizedAddress = normalizeText(address)
    const normalizedCity = normalizeText(city)
    const normalizedDescription = normalizeText(description)
    const normalizedOpeningTime = normalizeText(openingTime)
    const normalizedClosingTime = normalizeText(closingTime)
    const normalizedRulesPolicies = normalizeText(rulesPolicies)
    const normalizedAmenities = normalizeStringArray(amenities)
    const normalizedImages = normalizeStringArray(images)
    const resolvedPhone = normalizeText(phoneNumber) || normalizeText(phone) || ""
    const resolvedOwnerFullName =
      normalizeText(ownerFullName) || clerkFullName
    const resolvedEmail = normalizeText(email) || clerkEmail
    const resolvedOpeningHours =
      normalizeText(openingHours) ||
      [normalizedOpeningTime, normalizedClosingTime].filter(Boolean).join(" - ")

    if (
      !normalizedKaraokeName ||
      !resolvedOwnerFullName ||
      !resolvedPhone ||
      !resolvedEmail ||
      !normalizedAddress ||
      !normalizedCity ||
      !normalizedDescription ||
      !normalizedOpeningTime ||
      !normalizedClosingTime
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
      name: normalizedKaraokeName,
      address: normalizedAddress,
      city: normalizedCity,
      phone: resolvedPhone,
      description: normalizedDescription,
      openingHours: resolvedOpeningHours,
      openingTime: normalizedOpeningTime,
      closingTime: normalizedClosingTime,
      amenities: normalizedAmenities,
      images: normalizedImages,
      rulesPolicies: normalizedRulesPolicies,
      approvalStatus: "pending",
      latitude: normalizeCoordinate(latitude),
      longitude: normalizeCoordinate(longitude),
      image: normalizedImages[0] ?? null,
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
