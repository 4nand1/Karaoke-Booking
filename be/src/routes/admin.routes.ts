import { Router } from "express"
import { getAuth } from "@clerk/express"
import { UserProfile } from "../models/UserProfile"

const router = Router()

router.get("/dashboard", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req)

  if (!isAuthenticated || !userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const profile = await UserProfile.findOne({ clerkUserId: userId })

  if (!profile || profile.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" })
  }

  return res.json({
    message: "Welcome to admin dashboard",
    profile,
  })
})

export default router