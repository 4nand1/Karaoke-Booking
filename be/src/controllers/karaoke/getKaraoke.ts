import { RequestHandler } from "express"
import { KaraokeModel } from "../../models/Karaoke"

export const getKaraoke: RequestHandler = async (req, res) => {
  try {
    const approvalStatus =
      typeof req.query.approvalStatus === "string"
        ? req.query.approvalStatus
        : null

    const filters =
      approvalStatus === "all"
        ? {}
        : approvalStatus
          ? { approvalStatus }
          : { approvalStatus: { $in: ["approved", "pending"] } }

    const karaokes = await KaraokeModel.find(filters).sort({ createdAt: -1 })

    return res.status(200).json({ karaokes })
  } catch (error) {
    console.error("getKaraoke error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
