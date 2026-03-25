import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isSignedInRoute = createRouteMatcher([
  "/profile(.*)",
  "/my-bookings(.*)",
  "/register-karaoke(.*)",
  "/admin/dashboard(.*)",
])

const isOwnerRoute = createRouteMatcher(["/admin/dashboard(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  if (isOwnerRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url })
    }

    const metadata = (sessionClaims?.metadata ?? {}) as {
      role?: string
      ownerStatus?: string | null
    }

    const isApprovedOwner =
      metadata.role === "karaoke_owner" && metadata.ownerStatus === "approved"

    if (!isApprovedOwner) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  }

  if (isSignedInRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
