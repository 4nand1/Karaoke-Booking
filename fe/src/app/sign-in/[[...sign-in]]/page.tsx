"use client"

import { useMemo, useState } from "react"
import { SignIn } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { clerkEnabled } from "@/lib/clerk-config"
import { Mic2, Store } from "lucide-react"
import { Button } from "@/components/ui/button"

type UiRole = "user" | "admin"

const STORAGE_KEY = "karaoke_app_selected_role"

function getInitialRole(
  queryRole: string | null,
  redirectUrl: string | null
): UiRole {
  if (queryRole === "admin") return "admin"
  if (queryRole === "user") return "user"

  if (redirectUrl) {
    const value = redirectUrl.toLowerCase()
    const adminHints = ["admin", "register", "venue", "karaoke", "host", "dashboard"]

    if (adminHints.some((hint) => value.includes(hint))) {
      return "admin"
    }
  }

  return "user"
}

export default function SignInPage() {
  const searchParams = useSearchParams()
  const queryRole = searchParams.get("role")
  const redirectUrlFromQuery =
    searchParams.get("redirect_url") ?? searchParams.get("redirectUrl")

  const initialRole = useMemo(
    () => getInitialRole(queryRole, redirectUrlFromQuery),
    [queryRole, redirectUrlFromQuery]
  )

  const [selectedRole, setSelectedRole] = useState<UiRole>(initialRole)

  const safeRedirectUrl =
    redirectUrlFromQuery && redirectUrlFromQuery.startsWith("/")
      ? redirectUrlFromQuery
      : null

  const authParams = new URLSearchParams()

  authParams.set("role", selectedRole)

  if (safeRedirectUrl) {
    authParams.set("redirect_url", safeRedirectUrl)
  }

  const postAuthUrl = authParams.size
    ? `/post-auth?${authParams.toString()}`
    : "/post-auth"

  const signUpUrl = authParams.size
    ? `/sign-up?${authParams.toString()}`
    : "/sign-up"

  if (!clerkEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        Authentication is not configured.
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
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 dark:hidden bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_22%),linear-gradient(135deg,rgba(248,250,255,1)_0%,rgba(238,242,255,1)_48%,rgba(224,231,255,1)_100%)]" />
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_bottom_right,rgba(255,51,153,0.16),transparent_24%),radial-gradient(circle_at_top_left,rgba(255,255,255,0.03),transparent_28%),linear-gradient(180deg,rgba(13,13,18,1)_0%,rgba(13,13,18,1)_68%,rgba(22,22,29,1)_100%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-[28px] border border-black/5 bg-white/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-2xl">
          <div className="mb-4 rounded-2xl border border-black/5 bg-white/85 p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="mb-3 text-center text-sm font-medium text-neutral-700 dark:text-white/70">
              I want to...
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedRole === "user" ? "neon" : "outline"}
                onClick={() => handleRoleChange("user")}
                className={`h-auto rounded-xl px-4 py-3 text-sm font-medium ${
                  selectedRole === "user"
                    ? "border-transparent"
                    : "border-black/10 bg-white/80 text-neutral-700 shadow-sm hover:border-primary/40 hover:bg-white hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <Mic2 className="h-4 w-4" />
                <span>Book Karaoke</span>
              </Button>

              <Button
                type="button"
                variant={selectedRole === "admin" ? "neon" : "outline"}
                onClick={() => handleRoleChange("admin")}
                className={`h-auto rounded-xl px-4 py-3 text-sm font-medium ${
                  selectedRole === "admin"
                    ? "border-transparent"
                    : "border-black/10 bg-white/80 text-neutral-700 shadow-sm hover:border-primary/40 hover:bg-white hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <Store className="h-4 w-4" />
                <span>List My Venue</span>
              </Button>
            </div>
          </div>

          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl={signUpUrl}
            fallbackRedirectUrl={postAuthUrl}
            appearance={{
              elements: {
                rootBox: "w-full",
                card:
                  "bg-white/92 dark:bg-zinc-950 border border-black/5 dark:border-white/10 rounded-2xl shadow-none backdrop-blur-sm",
                cardBox: "shadow-none",
                headerTitle: "text-neutral-900 dark:text-white",
                headerSubtitle: "text-neutral-500 dark:text-white/60",
                socialButtonsBlockButton:
                  "bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/10",
                socialButtonsBlockButtonText: "text-neutral-900 dark:text-white",
                dividerLine: "bg-black/10 dark:bg-white/10",
                dividerText: "text-neutral-400 dark:text-white/40",
                formFieldLabel: "text-neutral-700 dark:text-white/80",
                formFieldInput:
                  "bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/35",
                formButtonPrimary:
                  "bg-primary text-primary-foreground hover:opacity-90 shadow-lg",
                footerActionText: "text-neutral-500 dark:text-white/60",
                footerActionLink: "text-primary hover:text-primary/80",
                identityPreviewText: "text-neutral-900 dark:text-white",
                formResendCodeLink: "text-primary",
                otpCodeFieldInput:
                  "bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white",
                alert:
                  "bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-neutral-900 dark:text-white",
                alertText: "text-neutral-900 dark:text-white",
                footer: "bg-transparent",
              },
            }}
          />
        </div>
      </div>
    </main>
  )
}
