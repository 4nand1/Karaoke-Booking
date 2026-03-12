"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function PostAuthPage() {
  const router = useRouter()
  const { getToken, isLoaded } = useAuth()

  useEffect(() => {
    const run = async () => {
      if (!isLoaded) return

      const token = await getToken()
      if (!token) {
        router.replace("/sign-in")
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        router.replace("/dashboard")
        return
      }

      const data = await res.json()

      if (data.profile?.role === "admin") {
        router.replace("/admin/dashboard")
      } else {
        router.replace("/dashboard")
      }
    }

    run()
  }, [getToken, isLoaded, router])

  return <div className="p-6">Loading...</div>
}