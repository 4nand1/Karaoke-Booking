import { Router } from "express"
import { getAuth, clerkClient } from "@clerk/express"
import { UserProfile } from "../models/UserProfile"
import { KaraokeModel } from "../models/Karaoke"

const router = Router()

router.post("/approve-owner/:userId", async (req, res) => {
  try {
    const { isAuthenticated } = getAuth(req)

    if (!isAuthenticated) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const userId = req.params.userId

    const profile = await UserProfile.findOne({ clerkUserId: userId })

    if (!profile) {
      return res.status(404).json({ message: "User not found" })
    }

    profile.ownerStatus = "approved"
    await profile.save()

    await KaraokeModel.findOneAndUpdate(
      { ownerClerkUserId: userId },
      { approvalStatus: "approved" }
    )

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "karaoke_owner",
        ownerStatus: "approved",
      },
    })

    return res.json({ message: "Owner approved" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Server error" })
  }
})

export default router