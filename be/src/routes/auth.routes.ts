import { Router } from "express"
import { clerkClient, getAuth } from "@clerk/express"
import { UserProfile } from "../models/UserProfile"
import { KaraokeModel } from "../models/Karaoke"

const router = Router()

const getPrimaryEmail = (clerkUser: any) =>
  clerkUser.emailAddresses.find(
    (item: any) => item.id === clerkUser.primaryEmailAddressId
  )?.emailAddress || ""

const getFullName = (clerkUser: any) => {
  const firstName = clerkUser.firstName || ""
  const lastName = clerkUser.lastName || ""
  return `${firstName} ${lastName}`.trim() || "User"
}

const syncClerkMetadata = async (
  userId: string,
  role: "customer" | "karaoke_owner",
  ownerStatus: "pending" | "approved" | null
) => {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      role,
      ownerStatus,
    },
  })
}

const loadCurrentUserState = async (userId: string) => {
  let profile = await UserProfile.findOne({ clerkUserId: userId })

  if (!profile) {
    const clerkUser = await clerkClient.users.getUser(userId)

    profile = await UserProfile.create({
      clerkUserId: userId,
      email: getPrimaryEmail(clerkUser),
      fullName: getFullName(clerkUser),
      role: "customer",
      ownerStatus: null,
      karaokeId: null,
    })
  }

  const karaoke = await KaraokeModel.findOne({ ownerClerkUserId: userId })

  const rawRole = String((profile as any).role)
  const updates: Record<string, unknown> = {}

  if (rawRole === "user") {
    updates.role = "customer"
  }

  if (rawRole === "admin") {
    updates.role = "karaoke_owner"
    updates.ownerStatus = (profile as any).ownerStatus ?? "approved"
  }

  if (karaoke) {
    updates.karaokeId = String(karaoke._id)

    if ((updates.role ?? rawRole) === "customer") {
      updates.role = "karaoke_owner"
    }

    if ((profile as any).ownerStatus == null && updates.ownerStatus == null) {
      updates.ownerStatus =
        (karaoke as any).approvalStatus === "pending" ? "pending" : "approved"
    }
  }

  if (Object.keys(updates).length > 0) {
    profile = await UserProfile.findOneAndUpdate(
      { clerkUserId: userId },
      updates,
      { new: true }
    )
  }

  await syncClerkMetadata(
    userId,
    (profile as any).role,
    (profile as any).ownerStatus ?? null
  )

  return { profile, karaoke }
}

router.get("/health", (_req, res) => {
  res.json({ ok: true })
})

router.get("/me", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req)

    if (!isAuthenticated || !userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { profile, karaoke } = await loadCurrentUserState(userId)

    return res.json({
      userId,
      profile,
      karaoke,
    })
  } catch (error) {
    console.error("GET /me failed:", error)
    return res.status(500).json({ message: "Server error" })
  }
})

router.get("/me/profile", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req)

    if (!isAuthenticated || !userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { profile, karaoke } = await loadCurrentUserState(userId)

    return res.json({
      profile,
      karaoke,
    })
  } catch (error) {
    console.error("GET /me/profile failed:", error)
    return res.status(500).json({ message: "Server error" })
  }
})

export default router