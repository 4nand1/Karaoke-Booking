import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { clerkEnabled } from "@/lib/clerk-config"

type ProfileResponse = {
  profile?: {
    fullName?: string
    email?: string
    role?: string
    ownerStatus?: string | null
  }
}

async function getProfile() {
  if (!clerkEnabled) {
    return null
  }

  const { userId, getToken } = await auth()

  if (!userId) redirect("/sign-in")

  const token = await getToken()

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) return null

  return (await res.json()) as ProfileResponse
}

export default async function ProfilePage() {
  if (!clerkEnabled) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <div className="border rounded-2xl p-6">
          <h1 className="text-xl font-bold">Profile</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Authentication is not configured for this environment yet.
          </p>
        </div>
      </main>
    )
  }

  const data = await getProfile()

  return (
    <main className="max-w-xl mx-auto p-6">
      <div className="border rounded-2xl p-6">
        <h1 className="text-xl font-bold">Profile</h1>

        <div className="mt-4 space-y-2 text-sm">
          <p><b>Name:</b> {data?.profile?.fullName || "-"}</p>
          <p><b>Email:</b> {data?.profile?.email || "-"}</p>
          <p><b>Role:</b> {data?.profile?.role || "customer"}</p>
          <p><b>Status:</b> {data?.profile?.ownerStatus || "-"}</p>
        </div>
      </div>
    </main>
  )
}
