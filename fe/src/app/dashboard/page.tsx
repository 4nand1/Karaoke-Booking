import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { clerkEnabled } from "@/lib/clerk-config"

export default async function DashboardPage() {
  if (!clerkEnabled) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        Authentication is not configured for this environment yet.
      </main>
    )
  }

  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await currentUser()

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back to KaraokeNow.
        </p>

        <div className="mt-6 space-y-3">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {user?.firstName || user?.fullName || "User"}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {user?.primaryEmailAddress?.emailAddress || "No email found"}
          </p>
          <p>
            <span className="font-semibold">Clerk User ID:</span> {userId}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">My Bookings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            See your upcoming karaoke bookings.
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Booking History</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your previous reservations.
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Payments</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Track completed and pending payments.
          </p>
        </div>
      </div>
    </main>
  )
}
