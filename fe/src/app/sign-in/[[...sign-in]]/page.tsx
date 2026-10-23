"use client"

import { Suspense } from "react"
import { SignIn } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { AuthShell, clerkAppearance } from "@/_components/client/AuthShell"

function SignInContent() {
  const redirect = useSearchParams().get("redirect_url")
  const postAuth = "/post-auth" + (redirect ? `?redirect_url=${encodeURIComponent(redirect)}` : "")

  return (
    <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl={postAuth} appearance={clerkAppearance} />
  )
}

export default function SignInPage() {
  return (
    <AuthShell>
      <Suspense>
        <SignInContent />
      </Suspense>
    </AuthShell>
  )
}
