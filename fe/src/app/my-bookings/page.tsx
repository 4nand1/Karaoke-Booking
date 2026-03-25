"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  Clock3,
  CircleCheck,
  CreditCard,
  MapPin,
  Mic2,
  Music4,
  Users,
} from "lucide-react"
import { api } from "@/lib/axios"

type Booking = {
  _id: string
  customerName?: string
  karaokeId?: string
  karaokeName?: string
  karaokeAddress?: string
  karaokeCity?: string
  karaokeImage?: string
  roomId?: string
  roomName?: string
  roomType?: string
  roomPrice?: number | null
  roomCapacity?: number | null
  roomImage?: string
  bookingDate?: string
  bookingSlots?: string[]
  guestCount?: number
  totalAmount?: number
  status?: "pending" | "confirmed" | "cancelled"
  paymentStatus?: "unpaid" | "paid" | "refunded"
  createdAt?: string
}

export default function MyBookingsPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    setPaymentSuccess(params.get("payment") === "success")
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.replace("/sign-in")
      return
    }

    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError("")

        const token = await getToken()
        const response = await fetch(`${api.defaults.baseURL}/orders?scope=my`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!response.ok) {
          throw new Error("Failed to load your bookings")
        }

        const data = (await response.json()) as Booking[]
        setBookings(Array.isArray(data) ? data : [])
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load your bookings"
        )
      } finally {
        setLoading(false)
      }
    }

    void fetchBookings()
  }, [getToken, isLoaded, isSignedIn, router])

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="rounded-2xl border p-6">
        <h1 className="text-xl font-bold">My Bookings</h1>

        {paymentSuccess ? (
          <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600">
            Your Stripe payment was successful and your booking is now confirmed.
          </div>
        ) : null}

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Loading your bookings...
          </p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Booking history will appear here.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="overflow-hidden rounded-2xl border bg-card">
                <div className="grid md:grid-cols-[220px_1fr]">
                  <div className="relative min-h-48 bg-muted">
                    <Image
                      src={booking.karaokeImage || booking.roomImage || "/karaoke.jpg"}
                      alt={booking.karaokeName || "Booked karaoke"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 220px"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">
                            Booked karaoke
                          </p>
                          <p className="mt-1 text-xl font-semibold">
                            {booking.karaokeName || "Your karaoke booking"}
                          </p>
                          {(booking.karaokeAddress || booking.karaokeCity) && (
                            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {[booking.karaokeAddress, booking.karaokeCity]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <span className="flex items-center gap-2">
                            <Mic2 className="h-4 w-4" />
                            {booking.roomName
                              ? `${booking.roomName}${booking.roomType ? ` · ${booking.roomType}` : ""}`
                              : "Room info unavailable"}
                          </span>
                          <span className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {booking.bookingDate || "Date not set"}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            {booking.bookingSlots?.join(", ") || "No time slots"}
                          </span>
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {booking.guestCount || 1} guest(s)
                          </span>
                          {booking.roomCapacity ? (
                            <span className="flex items-center gap-2">
                              <Music4 className="h-4 w-4" />
                              Capacity {booking.roomCapacity}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm sm:text-right">
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary">
                            <CircleCheck className="h-4 w-4" />
                            {booking.status || "pending"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-green-600">
                            <CreditCard className="h-4 w-4" />
                            {booking.paymentStatus || "unpaid"}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground">
                          ₮{(booking.totalAmount ?? 0).toLocaleString()}
                        </p>
                        {booking.karaokeId ? (
                          <Link
                            href={`/book/${booking.karaokeId}`}
                            className="inline-flex rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-accent"
                          >
                            View booking page
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
