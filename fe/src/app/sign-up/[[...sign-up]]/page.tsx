"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"

type ProfileResponse = {
  profile?: {
    role?: "customer" | "karaoke_owner"
    ownerStatus?: "pending" | "approved" | null
  } | null
}

export default function PostAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getToken, isLoaded } = useAuth()

  useEffect(() => {
    const run = async () => {
      if (!isLoaded) return

      const redirectUrlFromQuery =
        searchParams.get("redirect_url") ?? searchParams.get("redirectUrl")

      const safeRedirectUrl =
        redirectUrlFromQuery && redirectUrlFromQuery.startsWith("/")
          ? redirectUrlFromQuery
          : null

      const token = await getToken()

      if (!token) {
        router.replace("/sign-in")
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        })

        if (!res.ok) {
          router.replace("/")
          return
        }

        const data: ProfileResponse = await res.json()

        if (safeRedirectUrl) {
          router.replace(safeRedirectUrl)
          return
        }

        if (
          data.profile?.role === "karaoke_owner" &&
          data.profile?.ownerStatus === "approved"
        ) {
          router.replace("/admin/dashboard")
          return
        }

        router.replace("/")
      } catch {
        router.replace("/")
      }
    }

    run()
  }, [getToken, isLoaded, router, searchParams])

  return <div className="p-6">Loading...</div>
}