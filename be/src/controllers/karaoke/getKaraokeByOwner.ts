import type { RequestHandler } from "express"
import { getAuth } from "@clerk/express"
import { KaraokeModel } from "../../models/Karaoke"
import { resolveOwnerKaraokes } from "../../services/ownerReconciliation"

export const getKaraokeByOwner: RequestHandler = async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req)
    const ownerClerkUserId =
      userId ||
      (typeof req.query.ownerClerkUserId === "string"
        ? req.query.ownerClerkUserId
        : null)

    if (!isAuthenticated && !ownerClerkUserId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const karaokes = userId
      ? (await resolveOwnerKaraokes(userId)).karaokes
      : await KaraokeModel.find({ ownerClerkUserId }).sort({
          createdAt: -1,
        })

    if (!karaokes.length) {
      return res.status(404).json({ message: "Karaoke not found" })
    }

    return res.status(200).json({
      karaoke: karaokes[0],
      karaokes,
    })
  } catch (error) {
    console.error("getKaraokeByOwner error:", error)
    return res.status(500).json({ message: "Failed to fetch karaoke" })
  }
}
