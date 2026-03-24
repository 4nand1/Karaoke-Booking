import type { RequestHandler } from "express"
import { getAuth } from "@clerk/express"
import { KaraokeModel } from "../../models/Karaoke"
import { isDatabaseConnected } from "../../config/db"

export const getKaraokeById: RequestHandler = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: "Database is not connected yet" })
    }

    const { id } = req.params
    const { userId } = process.env.CLERK_SECRET_KEY
      ? getAuth(req)
      : { userId: null }

    const karaoke = await KaraokeModel.findById(id)

    if (!karaoke) {
      return res.status(404).json({ message: "Karaoke not found" })
    }

    const isOwner = !!userId && karaoke.ownerClerkUserId === userId
    const isPublic =
      karaoke.approvalStatus === "approved" ||
      karaoke.approvalStatus === "pending"

    if (!isOwner && !isPublic) {
      return res.status(404).json({ message: "Karaoke not found" })
    }

    return res.status(200).json({ karaoke })
  } catch (error) {
    console.error("getKaraokeById error:", error)
    return res.status(500).json({ message: "Failed to fetch karaoke" })
  }
}
