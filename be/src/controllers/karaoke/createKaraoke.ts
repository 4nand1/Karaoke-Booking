import type { RequestHandler } from "express"
import { getAuth } from "@clerk/express"
import { KaraokeModel } from "../../models/Karaoke"
import { UserProfile } from "../../models/UserProfile"

const normalizeRole = (value: unknown): "customer" | "karaoke_owner" => {
  const role = String(value || "").trim().toLowerCase()

  if (role === "admin" || role === "karaoke_owner") {
    return "karaoke_owner"
  }

  return "customer"
}

export const createKaraoke: RequestHandler = async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req)

    if (!isAuthenticated || !userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const profile = await UserProfile.findOne({ clerkUserId: userId }).lean()
    const role = normalizeRole((profile as any)?.role)

    if (role !== "karaoke_owner") {
      return res.status(403).json({
        message: "Access denied. Only admin accounts can register karaokes.",
      })
    }

    const {
      karaokeName,
      ownerFullName,
      email,
      address,
      city,
      phone,
      phoneNumber,
      description,
      openingHours,
      openingTime,
      closingTime,
      roomTypes,
      pricePerHour,
      capacity,
      amenities,
      images,
      rulesPolicies,
      latitude,
      longitude,
    } = req.body

    const normalizedImages = Array.isArray(images)
      ? images.filter(Boolean)
      : []

    const karaoke = await KaraokeModel.create({
      ownerClerkUserId: userId,
      ownerFullName: ownerFullName ?? "",
      email: email ?? "",
      name: karaokeName,
      address,
      city,
      phone: phone ?? phoneNumber ?? "",
      description,
      openingHours:
        openingHours || [openingTime, closingTime].filter(Boolean).join(" - "),
      openingTime,
      closingTime,
      roomTypes: Array.isArray(roomTypes) ? roomTypes : [],
      pricePerHour:
        pricePerHour === undefined || pricePerHour === null || pricePerHour === ""
          ? null
          : Number(pricePerHour),
      capacity:
        capacity === undefined || capacity === null || capacity === ""
          ? null
          : Number(capacity),
      amenities: Array.isArray(amenities) ? amenities : [],
      images: normalizedImages,
      image: normalizedImages[0] ?? null,
      rulesPolicies: rulesPolicies ?? "",
      approvalStatus: "pending",
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    })

    await UserProfile.findOneAndUpdate(
      { clerkUserId: userId },
      {
        karaokeId: String((karaoke as any)._id),
        role: "karaoke_owner",
        ownerStatus: "approved",
      }
    )

    return res.status(201).json({ karaoke })
  } catch (error) {
    console.error("createKaraoke error:", error)
    return res.status(500).json({ message: "Failed to create karaoke" })
  }
}
