import type { RequestHandler } from "express"
import { KaraokeModel } from "../../models/Karaoke"

export const getKaraokeByOwner: RequestHandler = async (req, res) => {
  try {
    const { ownerClerkUserId } = req.query

    const karaoke = await KaraokeModel.findOne({ ownerClerkUserId })

    if (!karaoke) {
      res.status(404).json({ message: "Karaoke not found" })
      return
    }

    res.status(200).json(karaoke)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch karaoke" })
  }
}