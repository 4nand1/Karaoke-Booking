import type { RequestHandler } from "express"
import { KaraokeModel } from "../../models/Karaoke"

export const createKaraoke: RequestHandler = async (req, res) => {
  try {
    const { karaokeName, address, city, phone, description, openingTime, closingTime, ownerClerkUserId, latitude, longitude } = req.body

    const existing = await KaraokeModel.findOne({ ownerClerkUserId })
    if (existing) {
      res.status(400).json({ message: "Та аль хэдийн каraoke бүртгүүлсэн байна" })
      return
    }

    const karaoke = await KaraokeModel.create({
      ownerClerkUserId,
      name: karaokeName,
      address,
      city,
      phone,
      description,
      openingTime,
      closingTime,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    })

    res.status(201).json(karaoke)
  } catch (error) {
    console.error("createKaraoke error:", error)
    res.status(500).json({ message: "Failed to create karaoke" })
  }
}