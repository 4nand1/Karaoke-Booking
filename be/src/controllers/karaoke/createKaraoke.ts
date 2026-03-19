import type { RequestHandler } from "express"
import { getAuth } from "@clerk/express"
import { KaraokeModel } from "../../models/Karaoke"

export const createKaraoke: RequestHandler = async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req)

    if (!isAuthenticated || !userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const {
      karaokeName,
      address,
      city,
      phone,
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

    const existing = await KaraokeModel.findOne({ ownerClerkUserId: userId })
    if (existing) {
      res.status(400).json({ message: "Та аль хэдийн karaoke бүртгүүлсэн байна" })
      return
    }

    const karaoke = await KaraokeModel.create({
      ownerClerkUserId: userId,
      name: karaokeName,
      address,
      city,
      phone,
      description,
      openingHours:
        openingHours || [openingTime, closingTime].filter(Boolean).join(" - "),
      openingTime: openingTime ?? null,
      closingTime: closingTime ?? null,
      roomTypes: Array.isArray(roomTypes) ? roomTypes : [],
      pricePerHour,
      capacity,
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
      rulesPolicies: rulesPolicies ?? "",
      approvalStatus: "pending",
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    })

    res.status(201).json(karaoke)
  } catch (error) {
    console.error("createKaraoke error:", error)
    res.status(500).json({ message: "Failed to create karaoke" })
  }
}