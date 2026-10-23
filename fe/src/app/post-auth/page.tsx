"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { api, apiError } from "@/lib/axios"
import { useLanguage } from "@/lib/language"

// Only same-origin paths, never back into the auth pages.
function safeRedirect(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value, window.location.origin)
    if (url.origin !== window.location.origin) return null
    if (url.pathname.startsWith("/sign-") || url.pathname.startsWith("/post-auth")) return null
    return url.pathname + url.search
  } catch {
    return null
  }
}

function PostAuthContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { t } = useLanguage()
  const { isLoaded, isSignedIn, user } = useUser()
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace("/sign-in")
      return
    }

    async function finish() {
      try {
        const { data } = await api.get("/me/profile")
        let role: string | undefined = data?.profile?.role

        // Owners only ever opt in here; a customer role is never posted (it would 409 for owners).
        if (params.get("role") === "admin" && role !== "karaoke_owner") {
          await api.post("/me/role", { role: "karaoke_owner" })
          role = "karaoke_owner"
        }

        await user?.reload()
        router.replace(safeRedirect(params.get("redirect_url")) ?? (role === "karaoke_owner" ? "/admin/dashboard" : "/"))
      } catch (e) {
        setError(apiError(e, t("Something went wrong", "Алдаа гарлаа")))
      }
    }
    void finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when auth resolves
  }, [isLoaded, isSignedIn])

  return (
    <main id="main" className="grid min-h-svh place-items-center px-4 text-center">
      {error ? (
        <div className="space-y-3">
          <p className="text-destructive">{error}</p>
          <Link href="/post-auth" className="text-primary underline">
            {t("Try again", "Дахин оролдох")}
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="eq text-primary" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          {t("Signing you in…", "Нэвтэрч байна…")}
        </div>
      )}
    </main>
  )
}

export default function PostAuthPage() {
  return (
    <Suspense>
      <PostAuthContent />
    </Suspense>
  )
}
