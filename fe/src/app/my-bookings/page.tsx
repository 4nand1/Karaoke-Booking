import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { clerkEnabled } from "@/lib/clerk-config"

export default async function MyBookingsPage() {
  if (!clerkEnabled) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        Authentication is not configured for this environment yet.
      </main>
    )
  }

  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="border rounded-2xl p-6">
        <h1 className="text-xl font-bold">My Bookings</h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Booking history will appear here.
        </p>
      </div>
    </main>
  )
}
