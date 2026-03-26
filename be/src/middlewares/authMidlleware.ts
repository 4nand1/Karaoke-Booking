import type { RequestHandler } from "express"
import { getAuth } from "@clerk/express"
import { UserProfile } from "../models/UserProfile"
import { resolveOwnerKaraokes } from "../services/ownerReconciliation"

const normalizeRole = (value: unknown): "customer" | "karaoke_owner" => {
  const role = String(value || "").trim().toLowerCase()

  if (role === "admin" || role === "karaoke_owner") {
    return "karaoke_owner"
  }

  return "customer"
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const { isAuthenticated, userId } = getAuth(req)

  if (!isAuthenticated || !userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  next()
}

export const requireKaraokeAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { isAuthenticated, userId } = getAuth(req)

    if (!isAuthenticated || !userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    let profile = await UserProfile.findOne({ clerkUserId: userId }).lean()
    let role = normalizeRole((profile as any)?.role)

    if (role !== "karaoke_owner") {
      const { karaokes } = await resolveOwnerKaraokes(userId)

      if (karaokes.length) {
        profile = await UserProfile.findOne({ clerkUserId: userId }).lean()
        role = normalizeRole((profile as any)?.role)
      }
    }

    if (role !== "karaoke_owner") {
      return res.status(403).json({
        message: "Access denied. Karaoke owner access required.",
      })
    }

    next()
  } catch (error) {
    console.error("requireKaraokeAdmin error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
