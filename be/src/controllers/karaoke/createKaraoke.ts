import type { RequestHandler } from "express"
import { KaraokeModel } from "../../models/Karoake"

export const createKaraoke: RequestHandler = async (req, res) => {
  try {
    const { karaokeName, address, city, phone, description, openingTime, closingTime, ownerClerkUserId } = req.body

    const karaoke = await KaraokeModel.create({
      ownerClerkUserId,
      name: karaokeName,
      address,
      city,
      phone,
      description,
      openingTime,
      closingTime,
    })

    res.status(201).json(karaoke)
  } catch (error) {
    console.error("createKaraoke error:", error)
    res.status(500).json({ message: "Failed to create karaoke" })
  }
}