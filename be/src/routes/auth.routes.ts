import { Router } from "express"
import { clerkClient, getAuth } from "@clerk/express"
import { UserProfile } from "../models/UserProfile"
import { KaraokeModel } from "../models/Karaoke"

const router = Router()

type AppRole = "customer" | "karaoke_owner"
type OwnerStatus = "pending" | "approved" | null

const normalizeRole = (value: unknown): AppRole => {
  const role = String(value || "").trim().toLowerCase()

  if (role === "admin" || role === "karaoke_owner") {
    return "karaoke_owner"
  }

  return "customer"
}

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
  role: AppRole,
  ownerStatus: OwnerStatus
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

  const karaokes = await KaraokeModel.find({ ownerClerkUserId: userId }).sort({
    createdAt: -1,
  })
  const karaoke = karaokes[0] ?? null

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
    updates.karaokeId = String((karaoke as any)._id)

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
    normalizeRole((profile as any).role),
    ((profile as any).ownerStatus ?? null) as OwnerStatus
  )

  return { profile, karaoke, karaokes }
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

    const { profile, karaoke, karaokes } = await loadCurrentUserState(userId)

    return res.json({
      userId,
      profile,
      karaoke,
      canRegisterKaraoke: (profile as any)?.role === "karaoke_owner",
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

    const { profile, karaoke, karaokes } = await loadCurrentUserState(userId)

    return res.json({
      profile,
      karaoke,
      canRegisterKaraoke: (profile as any)?.role === "karaoke_owner",
    })
  } catch (error) {
    console.error("GET /me/profile failed:", error)
    return res.status(500).json({ message: "Server error" })
  }
})

router.post("/me/role", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req)

    if (!isAuthenticated || !userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const clerkUser = await clerkClient.users.getUser(userId)
    const requestedRole = normalizeRole(req.body?.role)

    let profile = await UserProfile.findOne({ clerkUserId: userId })

    if (!profile) {
      const ownerStatus: OwnerStatus =
        requestedRole === "karaoke_owner" ? "approved" : null

      profile = await UserProfile.create({
        clerkUserId: userId,
        email: getPrimaryEmail(clerkUser),
        fullName: getFullName(clerkUser),
        role: requestedRole,
        ownerStatus,
        karaokeId: null,
      })

      await syncClerkMetadata(userId, requestedRole, ownerStatus)

      return res.json({
        message: "Role created successfully",
        profile,
        canRegisterKaraoke: requestedRole === "karaoke_owner",
      })
    }

    const currentRole = normalizeRole((profile as any).role)
    const currentOwnerStatus = ((profile as any).ownerStatus ?? null) as OwnerStatus
    const existingKaraoke = await KaraokeModel.findOne({
      ownerClerkUserId: userId,
    }).lean()

    if (requestedRole === "customer" && currentRole !== "customer") {
      if (existingKaraoke) {
        await syncClerkMetadata(userId, currentRole, currentOwnerStatus)

        return res.status(409).json({
          message:
            "This account already owns a karaoke and cannot be switched to customer.",
          profile,
          canRegisterKaraoke: true,
        })
      }

      profile = await UserProfile.findOneAndUpdate(
        { clerkUserId: userId },
        {
          role: "customer",
          ownerStatus: null,
          karaokeId: null,
          email: getPrimaryEmail(clerkUser),
          fullName: getFullName(clerkUser),
        },
        { new: true }
      )

      await syncClerkMetadata(userId, "customer", null)

      return res.json({
        message: "Role updated successfully",
        profile,
        canRegisterKaraoke: false,
      })
    }

    if (requestedRole === "karaoke_owner" && currentRole !== "karaoke_owner") {
      profile = await UserProfile.findOneAndUpdate(
        { clerkUserId: userId },
        {
          role: "karaoke_owner",
          ownerStatus: "approved",
          email: getPrimaryEmail(clerkUser),
          fullName: getFullName(clerkUser),
        },
        { new: true }
      )

      await syncClerkMetadata(userId, "karaoke_owner", "approved")

      return res.json({
        message: "Role updated successfully",
        profile,
        canRegisterKaraoke: true,
      })
    }

    await syncClerkMetadata(userId, currentRole, currentOwnerStatus)

    return res.json({
      message: "Role already exists",
      profile,
      canRegisterKaraoke: currentRole === "karaoke_owner",
    })
  } catch (error) {
    console.error("POST /me/role failed:", error)
    return res.status(500).json({ message: "Server error" })
  }
})

export default router
