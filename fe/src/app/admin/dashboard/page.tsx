import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

type AdminProfileResponse = {
  profile?: {
    role?: "user" | "admin"
    fullName?: string
    email?: string
  }
  karaoke?: {
    _id?: string
    name?: string
    address?: string
    city?: string
    phone?: string
    openingTime?: string
    closingTime?: string
    description?: string
  }
}

async function getAdminData() {
  const { userId, getToken } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const token = await getToken()

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    return null
  }

  const data = (await res.json()) as AdminProfileResponse
  return data
}

export default async function AdminDashboardPage() {
  const data = await getAdminData()

  if (!data?.profile) {
    redirect("/dashboard")
  }

  if (data.profile.role !== "admin") {
    redirect("/dashboard")
  }

  const karaoke = data.karaoke

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your karaoke business, bookings, and payments.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-4">
            <h2 className="font-semibold">Owner Info</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {data.profile.fullName || "No name"}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {data.profile.email || "No email"}
              </p>
              <p>
                <span className="font-medium">Role:</span>{" "}
                {data.profile.role || "user"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <h2 className="font-semibold">Karaoke Info</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {karaoke?.name || "No karaoke registered"}
              </p>
              <p>
                <span className="font-medium">City:</span>{" "}
                {karaoke?.city || "-"}
              </p>
              <p>
                <span className="font-medium">Address:</span>{" "}
                {karaoke?.address || "-"}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {karaoke?.phone || "-"}
              </p>
              <p>
                <span className="font-medium">Hours:</span>{" "}
                {karaoke?.openingTime && karaoke?.closingTime
                  ? `${karaoke.openingTime} - ${karaoke.closingTime}`
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Bookings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            View and manage customer reservations.
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Payments</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Track payment status and revenue.
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Venue Settings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Update karaoke details, opening hours, and contact info.
          </p>
        </div>
      </div>

      {karaoke?.description ? (
        <div className="mt-6 rounded-2xl border p-4">
          <h2 className="font-semibold">Description</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {karaoke.description}
          </p>
        </div>
      ) : null}
    </main>
  )
}