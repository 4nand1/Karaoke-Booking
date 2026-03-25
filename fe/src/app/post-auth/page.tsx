"use client"

import { useEffect } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

type ProfileResponse = {
  profile?: {
    role?: "customer" | "karaoke_owner"
  }
}

export default function PostAuthPage() {
  const router = useRouter()
  const { getToken, isLoaded } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    const run = async () => {
      if (!isLoaded || !user) {
        console.log("[post-auth] Not loaded yet", { isLoaded, user })
        return
      }

      try {
        console.log("[post-auth] Starting auth check...")

        // Token refresh хийж metadata шинэчлэнэ
        const freshToken = await getToken({ skipCache: true })
        if (!freshToken) {
          console.error("[post-auth] No token available")
          router.replace("/sign-in")
          return
        }

        console.log("[post-auth] Got fresh token, fetching profile...")

        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) {
          throw new Error("NEXT_PUBLIC_API_URL not configured")
        }

        const res = await fetch(`${apiUrl}/api/me/profile`, {
          headers: {
            Authorization: `Bearer ${freshToken}`,
          },
        })

        console.log("[post-auth] Profile response status:", res.status)

        if (res.ok) {
          const data: ProfileResponse = await res.json()

          console.log("[post-auth] Profile data:", {
            role: data.profile?.role,
          })

          // KaraokeOwner бол админ page руу явна
          if (data.profile?.role === "karaoke_owner") {
            console.log("[post-auth] ✅ Redirecting to /admin (owner)")
            router.replace("/admin")
            return
          }

          // Customer бол homepage руу явна
          console.log("[post-auth] ✅ Redirecting to / (customer)")
          router.replace("/")
        } else {
          const errorText = await res.text()
          console.error("[post-auth] Profile fetch failed:", {
            status: res.status,
            error: errorText,
          })

          // 401 бол token хүчингүй, sign-in руу явна
          if (res.status === 401) {
            console.log("[post-auth] Unauthorized, redirecting to sign-in")
            router.replace("/sign-in")
          } else {
            router.replace("/")
          }
        }
      } catch (error) {
        console.error("[post-auth] Error:", error)
        router.replace("/")
      }
    }

    run()
  }, [getToken, isLoaded, user, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0118] text-white">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto"></div>
        <p className="text-lg">Нэвтэрч байна...</p>
      </div>
    </div>
  )
}