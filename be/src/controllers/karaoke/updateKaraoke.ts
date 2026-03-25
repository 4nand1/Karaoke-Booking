import { RequestHandler } from "express"
import { KaraokeModel } from "../../models/Karaoke"

export const updateKaraoke: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const body = { ...req.body }

    if (body.karaokeName && !body.name) {
      body.name = body.karaokeName
      delete body.karaokeName
    }

    if (body.phoneNumber && !body.phone) {
      body.phone = body.phoneNumber
      delete body.phoneNumber
    }

    if (!body.openingHours && (body.openingTime || body.closingTime)) {
      body.openingHours = [body.openingTime, body.closingTime]
        .filter(Boolean)
        .join(" - ")
    }

    if (Array.isArray(body.images)) {
      body.image = body.images[0] ?? null
    }

    const karaoke = await KaraokeModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!karaoke) {
      return res.status(404).json({ message: "Karaoke not found" })
    }

    return res.status(200).json({ karaoke })
  } catch (error) {
    console.error("updateKaraoke error:", error)
    return res.status(500).json({ message: "Failed to update karaoke" })
  }
}
