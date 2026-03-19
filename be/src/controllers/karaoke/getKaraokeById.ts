import type { RequestHandler } from "express"
import { getAuth } from "@clerk/express"
import { KaraokeModel } from "../../models/Karaoke"

export const getKaraokeById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = getAuth(req)

    const karaoke = await KaraokeModel.findById(id)

    if (!karaoke) {
      return res.status(404).json({ message: "Karaoke not found" })
    }

    const isOwner = !!userId && karaoke.ownerClerkUserId === userId
    const isPublic = karaoke.approvalStatus === "approved"

    if (!isOwner && !isPublic) {
      return res.status(404).json({ message: "Karaoke not found" })
    }

    return res.status(200).json({ karaoke })
  } catch (error) {
    console.error("getKaraokeById error:", error)
    return res.status(500).json({ message: "Failed to fetch karaoke" })
  }
}