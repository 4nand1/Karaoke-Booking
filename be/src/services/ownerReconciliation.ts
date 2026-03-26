import { clerkClient } from "@clerk/express"
import Booking from "../models/Booking"
import { KaraokeModel } from "../models/Karaoke"
import { UserProfile } from "../models/UserProfile"

function getPrimaryEmail(clerkUser: any) {
  return (
    clerkUser.emailAddresses.find(
      (item: any) => item.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || ""
  )
}

function getFullName(clerkUser: any) {
  const firstName = clerkUser.firstName || ""
  const lastName = clerkUser.lastName || ""
  return `${firstName} ${lastName}`.trim() || "User"
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export async function resolveOwnerKaraokes(userId: string) {
  const currentKaraokes = await KaraokeModel.find({ ownerClerkUserId: userId }).sort({
    createdAt: -1,
  })

  if (currentKaraokes.length) {
    return { karaokes: currentKaraokes, relinked: false }
  }

  const clerkUser = await clerkClient.users.getUser(userId)
  const primaryEmail = normalizeEmail(getPrimaryEmail(clerkUser))

  if (!primaryEmail) {
    return { karaokes: [], relinked: false }
  }

  const emailMatcher = new RegExp(`^${escapeRegex(primaryEmail)}$`, "i")
  const legacyKaraokes = await KaraokeModel.find({ email: emailMatcher }).sort({
    createdAt: -1,
  })

  if (!legacyKaraokes.length) {
    return { karaokes: [], relinked: false }
  }

  const karaokeIds = legacyKaraokes.map((karaoke) => karaoke._id)

  await KaraokeModel.updateMany(
    { _id: { $in: karaokeIds } },
    {
      $set: {
        ownerClerkUserId: userId,
        email: primaryEmail,
      },
    }
  )

  await Booking.updateMany(
    { karaokeId: { $in: karaokeIds.map((id) => String(id)) } },
    { $set: { ownerClerkUserId: userId } }
  )

  const currentProfile = await UserProfile.findOne({ clerkUserId: userId })

  if (currentProfile) {
    currentProfile.email = primaryEmail
    currentProfile.fullName = getFullName(clerkUser)
    currentProfile.role = "karaoke_owner"
    currentProfile.ownerStatus = currentProfile.ownerStatus ?? "approved"
    currentProfile.karaokeId = String(legacyKaraokes[0]?._id ?? "")
    await currentProfile.save()
  } else {
    await UserProfile.findOneAndUpdate(
      { clerkUserId: userId },
      {
        clerkUserId: userId,
        email: primaryEmail,
        fullName: getFullName(clerkUser),
        role: "karaoke_owner",
        ownerStatus: "approved",
        karaokeId: String(legacyKaraokes[0]?._id ?? ""),
      },
      { upsert: true, new: true }
    )
  }

  const reconciledKaraokes = await KaraokeModel.find({ ownerClerkUserId: userId }).sort({
    createdAt: -1,
  })

  return { karaokes: reconciledKaraokes, relinked: true }
}
