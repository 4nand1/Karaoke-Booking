import { SignIn } from "@clerk/nextjs"
import { clerkEnabled } from "@/lib/clerk-config"

export default function Page() {
  if (!clerkEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        Authentication is not configured for this environment yet.
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/post-auth"
      />
    </div>
  )
}
