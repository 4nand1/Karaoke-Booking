import type { RequestHandler } from "express"
import { Karaoke } from "../../models/Karoake"

export const getKaraoke: RequestHandler = async (req, res) => {
  try {
    const karaokes = await Karaoke.find()

    res.status(200).json(karaokes)
  } catch (error) {
    console.error("getKaraoke error:", error)

    res.status(500).json({
      message: "Failed to fetch karaokes",
    })
  }
}