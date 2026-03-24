"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { clerkEnabled } from "@/lib/clerk-config"

export default function PostAuthPage() {
  if (!clerkEnabled) {
    return <div className="p-6">Authentication is not configured.</div>
  }

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

      // Redirect to home regardless of the result
      router.replace("/")
    }

    run()
  }, [getToken, isLoaded, router])

  return <div className="p-6">Loading...</div>
}
