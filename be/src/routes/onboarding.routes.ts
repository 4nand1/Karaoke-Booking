import { Router } from "express"
import { clerkClient, getAuth } from "@clerk/express"
import { UserProfile } from "../models/UserProfile"
import { Karaoke } from "../models/Karoake"

const router = Router()

router.post("/karaoke", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req)

    if (!isAuthenticated || !userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const {
      karaokeName,
      address,
      city,
      phone,
      description,
      openingTime,
      closingTime,
      latitude,
      longitude,
    } = req.body as {
      karaokeName?: string
      address?: string
      city?: string
      phone?: string
      description?: string
      openingTime?: string
      closingTime?: string
      latitude?: number | null
      longitude?: number | null
    }

    if (
      !karaokeName ||
      !address ||
      !city ||
      !phone ||
      !description ||
      !openingTime ||
      !closingTime
    ) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const existing = await Karaoke.findOne({ ownerClerkUserId: userId })
    if (existing) {
      return res.status(409).json({ message: "Karaoke already registered" })
    }

    const clerkUser = await clerkClient.users.getUser(userId)
    const email = clerkUser.emailAddresses.find(
      (item) => item.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || ""

    const firstName = clerkUser.firstName || ""
    const lastName = clerkUser.lastName || ""
    const fullName = `${firstName} ${lastName}`.trim() || "Owner"

    const karaoke = await Karaoke.create({
      ownerClerkUserId: userId,
      name: karaokeName,
      address,
      city,
      phone,
      description,
      openingTime,
      closingTime,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    })

    await UserProfile.findOneAndUpdate(
      { clerkUserId: userId },
      {
        clerkUserId: userId,
        email,
        fullName,
        role: "admin",
        karaokeId: String(karaoke._id),
      },
      { upsert: true, new: true }
    )

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "admin",
      },
    })

    return res.status(201).json({
      message: "Karaoke registered successfully",
      karaoke,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Server error" })
  }
})

export default router