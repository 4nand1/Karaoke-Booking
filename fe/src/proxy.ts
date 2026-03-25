import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isSignedInRoute = createRouteMatcher([
  "/profile(.*)",
  "/my-bookings(.*)",
  "/admin(.*)",
  "/admin/dashboard(.*)",
])

const isOwnerRoute = createRouteMatcher(["/admin(.*)", "/admin/dashboard(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  if (isSignedInRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
