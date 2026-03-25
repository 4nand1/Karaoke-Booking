"use client"

import { useState } from "react"
import { SignUp } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { clerkEnabled } from "@/lib/clerk-config"

type UiRole = "user" | "admin"

const STORAGE_KEY = "karaoke_app_selected_role"

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const queryRole = searchParams.get("role")
  const redirectUrlFromQuery =
    searchParams.get("redirect_url") ?? searchParams.get("redirectUrl")

  const [selectedRole, setSelectedRole] = useState<UiRole>(
    queryRole === "admin" ? "admin" : "user"
  )

  const safeRedirectUrl =
    redirectUrlFromQuery && redirectUrlFromQuery.startsWith("/")
      ? redirectUrlFromQuery
      : null

  const authParams = new URLSearchParams()

  if (selectedRole === "admin") {
    authParams.set("role", "admin")
  }

  if (safeRedirectUrl) {
    authParams.set("redirect_url", safeRedirectUrl)
  }

  const postAuthUrl = authParams.size
    ? `/post-auth?${authParams.toString()}`
    : "/post-auth"

  const signInUrl = authParams.size
    ? `/sign-in?${authParams.toString()}`
    : "/sign-in"

  if (!clerkEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        Authentication is not configured for this environment yet.
      </div>
    )
  }

  const handleRoleChange = (role: UiRole) => {
    setSelectedRole(role)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, role)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-center text-sm font-medium text-gray-700">
          Choose account type
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleRoleChange("user")}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
              selectedRole === "user"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            User
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("admin")}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
              selectedRole === "admin"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Admin
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-gray-500">
          Only Admin accounts can register karaokes.
        </p>
      </div>

      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl={signInUrl}
        fallbackRedirectUrl={postAuthUrl}
      />
    </div>
  )
}
