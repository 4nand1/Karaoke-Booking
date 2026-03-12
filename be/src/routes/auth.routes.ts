import { Router } from "express"
import { clerkClient, getAuth } from "@clerk/express"
import { UserProfile } from "../models/UserProfile"
import { Karaoke } from "../models/Karoake"

const router = Router()

router.get("/health", (_req, res) => {
  res.json({ ok: true })
})

router.get("/me", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req)

  if (!isAuthenticated || !userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const profile = await UserProfile.findOne({ clerkUserId: userId })
  const karaoke = await Karaoke.findOne({ ownerClerkUserId: userId })

  return res.json({
    userId,
    profile,
    karaoke,
  })
})

router.get("/me/profile", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req)

  if (!isAuthenticated || !userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  let profile = await UserProfile.findOne({ clerkUserId: userId })

  if (!profile) {
    const clerkUser = await clerkClient.users.getUser(userId)

    const email = clerkUser.emailAddresses.find(
      (item) => item.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || ""

    const firstName = clerkUser.firstName || ""
    const lastName = clerkUser.lastName || ""
    const fullName = `${firstName} ${lastName}`.trim() || "User"

    profile = await UserProfile.create({
      clerkUserId: userId,
      email,
      fullName,
      role: "user",
    })
  }

  const karaoke = await Karaoke.findOne({ ownerClerkUserId: userId })

  return res.json({
    profile,
    karaoke,
  })
})

export default router