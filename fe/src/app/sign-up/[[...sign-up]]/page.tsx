"use client"

import { Suspense, useState } from "react"
import { SignUp } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { Mic2, Store } from "lucide-react"
import { AuthShell, clerkAppearance } from "@/_components/client/AuthShell"
import { useLanguage } from "@/lib/language"
import { cn } from "@/lib/utils"

function SignUpContent() {
  const { t } = useLanguage()
  const params = useSearchParams()
  const redirect = params.get("redirect_url")
  const [role, setRole] = useState<"user" | "admin">(params.get("role") === "admin" ? "admin" : "user")

  const options = [
    { value: "user" as const, label: t("I want to sing", "Дуулмаар байна"), icon: Mic2 },
    { value: "admin" as const, label: t("I own a venue", "Караоке эзэмшдэг"), icon: Store },
  ]
  const postAuth = `/post-auth?role=${role}${redirect ? `&redirect_url=${encodeURIComponent(redirect)}` : ""}`

  return (
    <>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1.5">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={role === value}
            onClick={() => setRole(value)}
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
              role === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl={postAuth} appearance={clerkAppearance} />
    </>
  )
}

export default function SignUpPage() {
  return (
    <AuthShell>
      <Suspense>
        <SignUpContent />
      </Suspense>
    </AuthShell>
  )
}
