import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Navbar from "@/_components/client/navbar"
import { UnifiedAdminDashboard } from "@/_components/admin/UnifiedAdminDashboard"
import type { RegisteredKaraoke } from "@/_components/admin/AdminRegister"
import { apiBaseUrl } from "@/lib/api-url"

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } }

async function load() {
  const { userId, getToken } = await auth()
  if (!userId) redirect("/sign-in")

  const headers = { Authorization: `Bearer ${await getToken()}` }
  const profileRes = await fetch(`${apiBaseUrl}/me/profile`, { headers, cache: "no-store" })
  if (!profileRes.ok) return null
  const { profile } = (await profileRes.json()) as { profile?: { role?: string } }
  if (profile?.role !== "karaoke_owner") return null

  const mineRes = await fetch(`${apiBaseUrl}/karaoke/mine`, { headers, cache: "no-store" })
  const mine = mineRes.ok ? ((await mineRes.json()) as { karaokes?: RegisteredKaraoke[] }) : {}
  return mine.karaokes ?? []
}

export default async function AdminDashboardPage() {
  const karaokes = await load()
  if (!karaokes) redirect("/my-bookings")

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-24">
        <UnifiedAdminDashboard initialKaraokes={karaokes} />
      </main>
    </>
  )
}
