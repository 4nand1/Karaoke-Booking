"use client"

import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import type { AxiosError } from "axios"
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

        const params =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : null

        const redirectUrlFromQuery =
          params?.get("redirect_url") ?? params?.get("redirectUrl")

        const safeRedirectUrl =
          redirectUrlFromQuery && redirectUrlFromQuery.startsWith("/")
            ? redirectUrlFromQuery
            : null

        const queryRole = params?.get("role")

        const savedRole =
          typeof window !== "undefined"
            ? window.localStorage.getItem(STORAGE_KEY)
            : null

        const selectedRole: UiRole =
          queryRole === "admin" || queryRole === "user"
            ? queryRole
            : savedRole === "admin"
              ? "admin"
              : "user"

        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, selectedRole)
        }

        const roleForApi: ApiRole =
          selectedRole === "admin" ? "karaoke_owner" : "customer"

        const meRes = await api.get<ProfileResponse>("/me/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const existingRole = meRes.data?.profile?.role

        const shouldSyncRole =
          !existingRole ||
          (selectedRole === "admin" && existingRole !== "karaoke_owner")

        if (shouldSyncRole) {
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
          router.replace("/admin")
          return
        }

        router.replace("/")
      } catch (err) {
        const message =
          (err as AxiosError<{ message?: string }>).response?.data?.message ||
          "Failed to complete login."

        setError(message)
      }
    }

    run()
  }, [getToken, isLoaded, isSignedIn, router])

  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <p className="text-lg font-semibold">Completing login...</p>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      </div>
    </div>
  )
}
