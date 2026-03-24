import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { apiRootUrl } from "@/lib/api-url"

type AdminProfileResponse = {
  profile?: {
    role?: "customer" | "karaoke_owner"
    ownerStatus?: "pending" | "approved" | null
    fullName?: string
    email?: string
  }
  karaoke?: {
    _id?: string
    ownerClerkUserId?: string
    name?: string
    address?: string
    city?: string
    phone?: string
    email?: string
    ownerFullName?: string
    openingHours?: string
    openingTime?: string
    closingTime?: string
    description?: string
    roomTypes?: string[]
    pricePerHour?: number
    capacity?: number
    amenities?: string[]
    rulesPolicies?: string
    approvalStatus?: "pending" | "approved"
  }
}

type Booking = {
  _id: string
  karaokeName: string
  roomName: string
  roomType: string
  customerName: string
  customerPhone: string
  bookingDate: string
  bookingTime: string
  bookingSlots?: string[]
  totalHours?: number
  guestCount: number
  totalAmount: number
  status: "pending" | "confirmed" | "cancelled"
}

async function getAdminData() {
  const { userId, getToken } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const token = await getToken()

  const res = await fetch(`${apiRootUrl}/api/me/profile`, {
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

  return (await res.json()) as AdminProfileResponse
}

async function getOwnerBookings(ownerClerkUserId?: string) {
  if (!ownerClerkUserId) {
    return []
  }

  const res = await fetch(
    `${apiRootUrl}/api/booking/owner/${ownerClerkUserId}`,
    {
      method: "GET",
      cache: "no-store",
    },
  )

  if (!res.ok) {
    return []
  }

  const data = (await res.json()) as { data?: Booking[] }
  return data.data ?? []
}

export default async function AdminDashboardPage() {
  const data = await getAdminData()

  if (!data?.profile) {
    redirect("/")
  }

  if (
    data.profile.role !== "karaoke_owner" ||
    data.profile.ownerStatus !== "approved"
  ) {
    redirect("/")
  }

  const karaoke = data.karaoke
  const bookings = await getOwnerBookings(karaoke?.ownerClerkUserId)

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your karaoke business, listings, bookings, and venue details.
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
                {data.profile.role || "customer"}
              </p>
              <p>
                <span className="font-medium">Owner status:</span>{" "}
                {data.profile.ownerStatus || "-"}
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
                <span className="font-medium">Owner:</span>{" "}
                {karaoke?.ownerFullName || "-"}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {karaoke?.email || "-"}
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
                {karaoke?.openingHours ||
                  (karaoke?.openingTime && karaoke?.closingTime
                    ? `${karaoke.openingTime} - ${karaoke.closingTime}`
                    : "-")}
              </p>
              <p>
                <span className="font-medium">Approval:</span>{" "}
                {karaoke?.approvalStatus || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Bookings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {bookings.length
              ? `${bookings.length} reservation${bookings.length > 1 ? "s" : ""} received.`
              : "No reservations yet."}
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

      <div className="mt-6 rounded-2xl border p-4">
        <h2 className="font-semibold">Recent Bookings</h2>
        {bookings.length ? (
          <div className="mt-4 space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-xl border border-border bg-background/60 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{booking.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.roomName} · {booking.roomType}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {booking.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-4">
                  <p>{booking.bookingDate}</p>
                  <p>{booking.bookingSlots?.join(", ") || booking.bookingTime}</p>
                  <p>{booking.customerPhone}</p>
                  <p>
                    {booking.guestCount} guests · {booking.totalHours || booking.bookingSlots?.length || 1} hr · ₮{booking.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Customers book hiisnii daraa end харагдана.
          </p>
        )}
      </div>

      {karaoke?.description ? (
        <div className="mt-6 rounded-2xl border p-4">
          <h2 className="font-semibold">Description</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {karaoke.description}
          </p>
        </div>
      ) : null}

      {karaoke?.roomTypes?.length ? (
        <div className="mt-6 rounded-2xl border p-4">
          <h2 className="font-semibold">Room Types</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {karaoke.roomTypes.map((roomType) => (
              <span
                key={roomType}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {roomType}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {(karaoke?.pricePerHour != null || karaoke?.capacity != null) && (
        <div className="mt-6 rounded-2xl border p-4">
          <h2 className="font-semibold">Pricing & Capacity</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="font-medium">Price per hour:</span>{" "}
              {karaoke?.pricePerHour ?? "-"}
            </p>
            <p>
              <span className="font-medium">Capacity:</span>{" "}
              {karaoke?.capacity ?? "-"}
            </p>
          </div>
        </div>
      )}

      {karaoke?.amenities?.length ? (
        <div className="mt-6 rounded-2xl border p-4">
          <h2 className="font-semibold">Amenities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {karaoke.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {karaoke?.rulesPolicies ? (
        <div className="mt-6 rounded-2xl border p-4">
          <h2 className="font-semibold">Rules / Policies</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {karaoke.rulesPolicies}
          </p>
        </div>
      ) : null}
    </main>
  )
}
