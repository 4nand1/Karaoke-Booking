"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthUser } from "@/types/auth"
import { getStoredToken, getStoredUser, logoutUser } from "@/lib/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = getStoredToken()
    const currentUser = getStoredUser()

    if (!token || !currentUser) {
      router.push("/login")
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
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>

      <div className="space-y-2 rounded-xl border p-4">
        <p>
          <span className="font-semibold">Name:</span> {user.name}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-semibold">Role:</span> {user.role}
        </p>
      </div>

      <div className="mt-4">
        {user.role === "admin" ? (
          <p className="text-sm">You are logged in as admin.</p>
        ) : (
          <p className="text-sm">You are logged in as user.</p>
        )}
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