import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isSignedInRoute = createRouteMatcher([
  "/profile(.*)",
  "/my-bookings(.*)",
  "/register-karaoke(.*)",
  "/admin/dashboard(.*)",
  "/admin(.*)",
])

const isOwnerRoute = createRouteMatcher(["/admin/dashboard(.*)", "/admin(.*)"])

const isHomeRoute = createRouteMatcher(["/", "/index"])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  // Homepage дээ KaraokeOwner орохгүй байхаар блок хийнэ
  if (isHomeRoute(req)) {
    if (userId) {
      const metadata = (sessionClaims?.metadata ?? {}) as {
        role?: string
      }

      const isKaraokeOwner = metadata.role === "karaoke_owner"

      if (isKaraokeOwner) {
        console.log("[proxy] KaraokeOwner trying to access homepage, redirecting to /admin")
        return NextResponse.redirect(new URL("/admin", req.url))
      }
    }

    return NextResponse.next()
  }

  if (isOwnerRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url })
    }

    const metadata = (sessionClaims?.metadata ?? {}) as {
      role?: string
    }

    const isKaraokeOwner = metadata.role === "karaoke_owner"

    if (!isKaraokeOwner) {
      console.log("[proxy] Non-owner trying to access /admin, redirecting to /")
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
