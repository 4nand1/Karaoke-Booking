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
  role: "customer" | "karaoke_owner"
) => {
  try {
    console.log(`[syncClerkMetadata] Syncing userId: ${userId}, role: ${role}`)
    
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
    })
    
    console.log(`[syncClerkMetadata] ✅ Successfully synced for userId: ${userId}`)
  } catch (error) {
    console.error(`[syncClerkMetadata] ❌ Error syncing metadata for userId: ${userId}`, error)
    throw error
  }
}

const loadCurrentUserState = async (userId: string) => {
  let profile = await UserProfile.findOne({ clerkUserId: userId })

  // Хэрэв профайл олдохгүй байвал, email ашиглаж дахин хайна (ID солигдсан тохиолдол)
  if (!profile) {
    try {
      const clerkUser = await clerkClient.users.getUser(userId)
      const email = getPrimaryEmail(clerkUser)
      
      // Email ашиглаж MongoDB дээр байгаа хүнийг хайна
      if (email) {
        const oldProfile = await UserProfile.findOne({ email })
        
        if (oldProfile) {
          console.log(`[loadCurrentUserState] 🔄 Merging profiles - old clerkUserId: ${oldProfile.clerkUserId}, new clerkUserId: ${userId}`)
          
          const oldUserId = oldProfile.clerkUserId
          
          // Хуучин ID-г шинээр солих
          oldProfile.clerkUserId = userId
          profile = await oldProfile.save()
          
          // Каракэнуудын ID-г солихыг оролдоно
          try {
            const updateResult = await KaraokeModel.updateMany(
              { ownerClerkUserId: oldUserId },
              { ownerClerkUserId: userId }
            )
            console.log(`[loadCurrentUserState] 🔄 Updated ${updateResult.modifiedCount} karaokes`)
          } catch (error) {
            console.warn(`[loadCurrentUserState] ⚠️ Failed to update karaokes:`, error)
          }
          
          console.log(`[loadCurrentUserState] ✅ Profile merged successfully`)
        } else {
          // Email-ээр олдохгүй байвал шинээр үүсгэнэ
          profile = await UserProfile.create({
            clerkUserId: userId,
            email,
            fullName: getFullName(clerkUser),
            role: "customer",
            ownerStatus: null,
            karaokeId: null,
          })
          
          console.log(`[loadCurrentUserState] ✨ New profile created for userId: ${userId}`)
        }
      }
    } catch (error) {
      console.error(`[loadCurrentUserState] ❌ Error finding/creating profile:`, error)
      throw error
    }
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
    (profile as any).role
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
      karaokes,
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

    console.log(`[GET /me/profile] Fetching profile for userId: ${userId}`)

    const { profile, karaoke, karaokes } = await loadCurrentUserState(userId)

    console.log(`[GET /me/profile] ✅ Profile loaded - role: ${(profile as any).role}, ownerStatus: ${(profile as any).ownerStatus}`)

    return res.json({
      profile,
      karaoke,
      karaokes,
    })
  } catch (error) {
    console.error("GET /me/profile failed:", error)
    return res.status(500).json({ message: "Server error" })
  }
})

export default router
