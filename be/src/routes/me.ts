import { Router } from "express"
import { clerkClient } from "@clerk/express"
import { UserProfile } from "../models/UserProfile"
import { KaraokeModel } from "../models/Karaoke"
import { resolveOwnerKaraokes } from "../services/ownerReconciliation"
import {
  fullName, normalizeRole, primaryEmail, requireAuth, syncClerkMetadata, userIdOf,
  type OwnerStatus,
} from "../lib/auth"
import { fail } from "../lib/http"

const router = Router()

async function loadCurrentUserState(userId: string) {
  let profile = await UserProfile.findOne({ clerkUserId: userId })

  if (!profile) {
    const clerkUser = await clerkClient.users.getUser(userId)
    profile = await UserProfile.create({
      clerkUserId: userId,
      email: primaryEmail(clerkUser),
      fullName: fullName(clerkUser),
      role: "customer",
      ownerStatus: null,
      karaokeId: null,
    })
  }

  const { karaokes } = await resolveOwnerKaraokes(userId)
  const karaoke = karaokes[0] ?? null

  // Normalise legacy roles and re-link the profile to the karaoke it owns.
  const updates: Record<string, unknown> = {}
  const rawRole = String(profile.role)
  if (rawRole === "user") updates.role = "customer"
  if (rawRole === "admin") {
    updates.role = "karaoke_owner"
    updates.ownerStatus = profile.ownerStatus ?? "approved"
  }
  if (karaoke) {
    updates.karaokeId = String(karaoke._id)
    if ((updates.role ?? rawRole) === "customer") updates.role = "karaoke_owner"
    if (profile.ownerStatus == null && updates.ownerStatus == null) {
      updates.ownerStatus = karaoke.approvalStatus === "pending" ? "pending" : "approved"
    }
  }
  if (Object.keys(updates).length) {
    profile = (await UserProfile.findOneAndUpdate({ clerkUserId: userId }, updates, { new: true }))!
  }

  await syncClerkMetadata(userId, normalizeRole(profile.role), (profile.ownerStatus ?? null) as OwnerStatus)
  return { profile, karaoke, karaokes }
}

router.get("/me", requireAuth, async (req, res) => {
  const userId = userIdOf(req)
  const { profile, karaoke } = await loadCurrentUserState(userId)
  res.json({ userId, profile, karaoke, canRegisterKaraoke: profile.role === "karaoke_owner" })
})

router.get("/me/profile", requireAuth, async (req, res) => {
  const { profile, karaoke } = await loadCurrentUserState(userIdOf(req))
  res.json({ profile, karaoke, canRegisterKaraoke: profile.role === "karaoke_owner" })
})

// Sign-up picks a role. An owner who already has a karaoke can't go back to customer.
router.post("/me/role", requireAuth, async (req, res) => {
  const userId = userIdOf(req)
  const requested = normalizeRole(req.body?.role)
  const clerkUser = await clerkClient.users.getUser(userId)
  const identity = { email: primaryEmail(clerkUser), fullName: fullName(clerkUser) }

  const current = await UserProfile.findOne({ clerkUserId: userId })
  const currentRole = current ? normalizeRole(current.role) : null

  if (current && currentRole === "karaoke_owner" && requested === "customer") {
    if (await KaraokeModel.exists({ ownerClerkUserId: userId })) {
      fail(409, "This account already owns a karaoke and cannot be switched to customer.")
    }
  }

  const ownerStatus: OwnerStatus =
    requested === "karaoke_owner" ? ((current?.ownerStatus as OwnerStatus) ?? "approved") : null

  const profile = await UserProfile.findOneAndUpdate(
    { clerkUserId: userId },
    {
      ...identity,
      role: requested,
      ownerStatus,
      ...(requested === "customer" ? { karaokeId: null } : {}),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  await syncClerkMetadata(userId, requested, ownerStatus)
  res.json({
    message: currentRole === requested ? "Role already exists" : "Role updated successfully",
    profile,
    canRegisterKaraoke: requested === "karaoke_owner",
  })
})

export default router
