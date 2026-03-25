import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UnifiedAdminDashboard } from "@/_components/admin/UnifiedAdminDashboard"
import { apiRootUrl } from "@/lib/api-url"

type AdminProfileResponse = {
  profile?: {
    role?: "customer" | "karaoke_owner"
    ownerStatus?: "pending" | "approved" | null
    fullName?: string
    email?: string
  }
}

type KaraokeRecord = {
  _id: string
  ownerClerkUserId?: string
  name: string
  address: string
  city: string
  phone: string
  email?: string
  ownerFullName?: string
  description: string
  openingHours?: string
  openingTime: string
  closingTime: string
  roomTypes?: string[]
  pricePerHour?: number | null
  capacity?: number | null
  amenities?: string[]
  images?: string[]
  rulesPolicies?: string
  approvalStatus?: "pending" | "approved" | "rejected" | "draft"
  rooms?: Array<{
    _id: string
    name: string
    type: "VIP" | "Medium" | "Small"
    price: number
    capacity: number
    image: string
    isAvailable: boolean
  }>
  menu?: Array<{
    _id: string
    name: string
    category: "food" | "drink" | "set"
    price: number
    description?: string
    image?: string
    isAvailable: boolean
  }>
}

async function getAdminData() {
  const { userId, getToken } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const token = await getToken()

  const profileRes = await fetch(`${apiRootUrl}/api/me/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!profileRes.ok) {
    return null
  }

  const profileData = (await profileRes.json()) as AdminProfileResponse

  const karaokeRes = await fetch(`${apiRootUrl}/karaoke/mine`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  let karaokes: KaraokeRecord[] = []

  if (karaokeRes.ok) {
    const karaokeData = (await karaokeRes.json()) as {
      karaoke?: KaraokeRecord
      karaokes?: KaraokeRecord[]
    }

    karaokes = Array.isArray(karaokeData.karaokes)
      ? karaokeData.karaokes
      : karaokeData.karaoke
        ? [karaokeData.karaoke]
        : []
  }

  return {
    profile: profileData.profile,
    karaokes,
  }
}

export default async function AdminDashboardPage() {
  const data = await getAdminData()

  if (!data?.profile) {
    redirect("/")
  }

  if (data.profile.role !== "karaoke_owner") {
    redirect("/")
  }

  return (
    <main className="mx-auto max-w-7xl p-6 md:p-8">
      <UnifiedAdminDashboard
        profile={data.profile}
        initialKaraokes={data.karaokes}
      />
    </main>
  )
}
