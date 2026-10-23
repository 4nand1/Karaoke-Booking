import type { Request, RequestHandler } from "express"
import { clerkClient, getAuth } from "@clerk/express"
import { KaraokeModel } from "../models/Karaoke"
import { fail } from "./http"

export type AppRole = "customer" | "karaoke_owner"
export type OwnerStatus = "pending" | "approved" | null

export const normalizeRole = (value: unknown): AppRole => {
  const role = String(value || "").trim().toLowerCase()
  return role === "admin" || role === "karaoke_owner" ? "karaoke_owner" : "customer"
}

type ClerkUser = Awaited<ReturnType<typeof clerkClient.users.getUser>>

export const primaryEmail = (user: ClerkUser) =>
  user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress || ""

export const fullName = (user: ClerkUser, fallback = "User") =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || fallback

export const syncClerkMetadata = (userId: string, role: AppRole, ownerStatus: OwnerStatus) =>
  clerkClient.users.updateUserMetadata(userId, { publicMetadata: { role, ownerStatus } })

/** Signed-in Clerk user id, or null for guests. */
export const optionalUserId = (req: Request) => {
  const { isAuthenticated, userId } = getAuth(req)
  return isAuthenticated && userId ? userId : null
}

/** Signed-in Clerk user id; throws 401 otherwise. */
export const userIdOf = (req: Request) => optionalUserId(req) ?? fail(401, "Unauthorized")

export const requireAuth: RequestHandler = (req, _res, next) => {
  userIdOf(req)
  next()
}

/** Loads the karaoke and makes sure the caller owns it. */
export const findOwnedKaraoke = async (req: Request, karaokeId: unknown) => {
  const userId = userIdOf(req)
  const karaoke = await KaraokeModel.findById(String(karaokeId))
  if (!karaoke) fail(404, "Karaoke not found")
  if (karaoke.ownerClerkUserId !== userId) fail(403, "You do not own this karaoke")
  return karaoke
}

/** Route guard for `/:id` routes: only the owner may continue. Puts the doc on res.locals.karaoke. */
export const requireOwner: RequestHandler = async (req, res, next) => {
  res.locals.karaoke = await findOwnedKaraoke(req, req.params.id)
  next()
}
