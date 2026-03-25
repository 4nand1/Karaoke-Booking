"use client"

import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/axios"

type UiRole = "user" | "admin"
type ApiRole = "customer" | "karaoke_owner"

type ProfileResponse = {
  profile?: {
    role?: ApiRole
    ownerStatus?: "pending" | "approved" | null
  } | null
  canRegisterKaraoke?: boolean
}

const STORAGE_KEY = "karaoke_app_selected_role"

export default function PostAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getToken, isLoaded } = useAuth()
  const { isSignedIn } = useUser()
  const [error, setError] = useState("")

  useEffect(() => {
    const run = async () => {
      if (!isLoaded) return

      if (!isSignedIn) {
        router.replace("/sign-in")
        return
      }

      try {
        const token = await getToken()

        if (!token) {
          router.replace("/sign-in")
          return
        }

        const redirectUrlFromQuery =
          searchParams.get("redirect_url") ?? searchParams.get("redirectUrl")

        const safeRedirectUrl =
          redirectUrlFromQuery && redirectUrlFromQuery.startsWith("/")
            ? redirectUrlFromQuery
            : null

        const savedRole =
          typeof window !== "undefined"
            ? window.localStorage.getItem(STORAGE_KEY)
            : null

        const selectedRole: UiRole = savedRole === "admin" ? "admin" : "user"
        const roleForApi: ApiRole =
          selectedRole === "admin" ? "karaoke_owner" : "customer"

        const meRes = await api.get<ProfileResponse>("/me/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const existingRole = meRes.data?.profile?.role

        if (!existingRole) {
          await api.post(
            "/me/role",
            { role: roleForApi },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        }

        const profileRes = await api.get<ProfileResponse>("/me/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const profile = profileRes.data?.profile

        if (safeRedirectUrl) {
          if (
            safeRedirectUrl.startsWith("/register-karaoke") &&
            profile?.role !== "karaoke_owner"
          ) {
            router.replace("/")
            return
          }

          router.replace(safeRedirectUrl)
          return
        }

        if (profile?.role === "karaoke_owner") {
          router.replace("/admin/dashboard")
          return
        }

        router.replace("/")
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to complete login.")
      }
    }

    run()
  }, [getToken, isLoaded, isSignedIn, router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <p className="text-lg font-semibold">Completing login...</p>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      </div>
    </div>
  )
}