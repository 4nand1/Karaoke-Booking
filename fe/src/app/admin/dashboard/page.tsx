"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStoredToken, getStoredUser, logoutUser } from "@/lib/auth"
import type { AuthUser } from "@/types/auth"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = getStoredToken()
    const currentUser = getStoredUser()

    if (!token || !currentUser) {
      router.push("/login")
      return
    }

    if (currentUser.role !== "admin") {
      router.push("/dashboard")
      return
    }

    setUser(currentUser)
  }, [router])

  function handleLogout() {
    logoutUser()
    router.push("/login")
  }

  if (!user) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2">Welcome, {user.name}</p>
      <p>{user.email}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">Bookings</h2>
          <p className="text-sm text-muted-foreground">See all customer bookings</p>
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">Payments</h2>
          <p className="text-sm text-muted-foreground">Track completed and pending payments</p>
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">Karaoke Details</h2>
          <p className="text-sm text-muted-foreground">Edit venue info, hours, contact and rooms</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 rounded-md bg-red-600 px-4 py-2 text-white"
      >
        Logout
      </button>
    </div>
  )
}