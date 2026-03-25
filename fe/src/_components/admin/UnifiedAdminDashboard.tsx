"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  MapPin,
  Music4,
  RefreshCw,
  Soup,
  Users,
} from "lucide-react"
import { apiRootUrl } from "@/lib/api-url"
import Link from "next/link"
import AdminRegister, { type RegisteredKaraoke } from "@/_components/admin/AdminRegister"
import { RoomsTab } from "@/_components/admin/RoomsTab"
import { MenuTab } from "@/_components/admin/MenuTab"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AdminProfile = {
  role?: "customer" | "karaoke_owner"
  ownerStatus?: "pending" | "approved" | null
  fullName?: string
  email?: string
}

type Booking = {
  _id: string
  karaokeId: string
  karaokeName: string
  roomId: string
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

type UnifiedAdminDashboardProps = {
  profile: AdminProfile
  initialKaraokes?: RegisteredKaraoke[]
}

export function UnifiedAdminDashboard({
  profile,
  initialKaraokes = [],
}: UnifiedAdminDashboardProps) {
  const { getToken } = useAuth()
  const [karaokes, setKaraokes] = useState<RegisteredKaraoke[]>(initialKaraokes)
  const [selectedKaraokeId, setSelectedKaraokeId] = useState(
    initialKaraokes[0]?._id ?? ""
  )
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState("")
  const [bookingError, setBookingError] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isBookingsLoading, setIsBookingsLoading] = useState(false)

  const selectedKaraoke = useMemo(
    () =>
      karaokes.find((karaoke) => karaoke._id === selectedKaraokeId) ??
      karaokes[0] ??
      null,
    [karaokes, selectedKaraokeId]
  )

  const selectedBookings = useMemo(
    () =>
      selectedKaraoke
        ? bookings.filter((booking) => booking.karaokeId === selectedKaraoke._id)
        : [],
    [bookings, selectedKaraoke]
  )

  const roomLoad = useMemo(() => {
    if (!selectedKaraoke) return []

    return (selectedKaraoke.rooms ?? []).map((room) => {
      const roomBookings = selectedBookings.filter(
        (booking) => booking.roomId === room._id
      )

      return {
        roomId: room._id,
        roomName: room.name,
        roomType: room.type,
        upcomingCount: roomBookings.length,
        bookedTimes: roomBookings.slice(0, 3).flatMap((booking) =>
          (booking.bookingSlots?.length ? booking.bookingSlots : [booking.bookingTime]).map(
            (slot) => `${booking.bookingDate} - ${slot}`
          )
        ),
      }
    })
  }, [selectedBookings, selectedKaraoke])

  useEffect(() => {
    if (!selectedKaraoke && karaokes[0]) {
      setSelectedKaraokeId(karaokes[0]._id)
    }
  }, [karaokes, selectedKaraoke])

  const formattedSelectedHours = useMemo(() => {
    if (!selectedKaraoke) return "-"

    const openingHours = selectedKaraoke.openingHours?.trim()

    if (openingHours) {
      return openingHours
        .replace(/\s*-\s*/g, " - ")
        .replace(/\s+/g, " ")
        .trim()
    }

    return `${selectedKaraoke.openingTime} - ${selectedKaraoke.closingTime}`
  }, [selectedKaraoke])

  async function refreshKaraokes(nextSelectedId?: string) {
    setIsRefreshing(true)
    setRefreshError("")

    try {
      const token = await getToken()

      if (!token) {
        throw new Error("Your session expired. Please sign in again.")
      }

      const res = await fetch(`${apiRootUrl}/karaoke/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      if (res.status === 404) {
        setKaraokes([])
        setSelectedKaraokeId("")
        return
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to load karaoke data.")
      }

      const nextKaraokes = Array.isArray(data.karaokes)
        ? (data.karaokes as RegisteredKaraoke[])
        : data.karaoke
          ? [data.karaoke as RegisteredKaraoke]
          : []

      setKaraokes(nextKaraokes)

      const fallbackId = nextKaraokes[0]?._id ?? ""
      const desiredId =
        nextKaraokes.find((item) => item._id === nextSelectedId)?._id ??
        nextKaraokes.find((item) => item._id === selectedKaraokeId)?._id ??
        fallbackId

      setSelectedKaraokeId(desiredId)
    } catch (error) {
      setRefreshError(
        error instanceof Error ? error.message : "Failed to refresh karaoke data."
      )
    } finally {
      setIsRefreshing(false)
    }
  }

  const refreshBookings = useCallback(async () => {
    if (!selectedKaraoke?.ownerClerkUserId) {
      setBookings([])
      setBookingError("")
      return
    }

    setIsBookingsLoading(true)
    setBookingError("")

    try {
      const res = await fetch(
        `${apiRootUrl}/api/booking/owner/${selectedKaraoke.ownerClerkUserId}`,
        {
          cache: "no-store",
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to load bookings.")
      }

      setBookings(Array.isArray(data.data) ? (data.data as Booking[]) : [])
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Failed to load booking data."
      )
    } finally {
      setIsBookingsLoading(false)
    }
  }, [selectedKaraoke?.ownerClerkUserId])

  useEffect(() => {
    void refreshBookings()

    if (!selectedKaraoke?.ownerClerkUserId) return

    const intervalId = window.setInterval(() => {
      void refreshBookings()
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [refreshBookings, selectedKaraoke?.ownerClerkUserId, selectedKaraoke?._id])

  function handleRegistered(karaoke: RegisteredKaraoke) {
    setKaraokes((prev) => [karaoke, ...prev.filter((item) => item._id !== karaoke._id)])
    setSelectedKaraokeId(karaoke._id)
    void refreshKaraokes(karaoke._id)
  }

  const steps = [
    {
      id: "register",
      title: "Register Karaoke",
      description: "Create the main karaoke profile and business details.",
      complete: karaokes.length > 0,
      icon: LayoutDashboard,
    },
    {
      id: "rooms",
      title: "Rooms Available",
      description: selectedKaraoke
        ? "Create rooms under the selected karaoke."
        : "Available after the karaoke is registered.",
      complete: (selectedKaraoke?.rooms?.length ?? 0) > 0,
      icon: Music4,
    },
    {
      id: "menu",
      title: "Menu",
      description: selectedKaraoke
        ? "Add food and drinks to the same karaoke."
        : "Available after the karaoke is registered.",
      complete: (selectedKaraoke?.menu?.length ?? 0) > 0,
      icon: Soup,
    },
  ] as const

  const dashboardStats = [
    {
      label: "Rooms",
      value: selectedKaraoke?.rooms?.length ?? 0,
      icon: Music4,
    },
    {
      label: "Menu Items",
      value: selectedKaraoke?.menu?.length ?? 0,
      icon: Soup,
    },
    {
      label: "Bookings",
      value: selectedBookings.length,
      icon: CalendarClock,
    },
    {
      label: "Pending",
      value: selectedBookings.filter((booking) => booking.status === "pending").length,
      icon: Activity,
    },
  ]

  return (
    <div className="space-y-8 text-slate-950 dark:text-slate-50">
      <section className="overflow-hidden rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#eef2ff_100%)] shadow-[0_30px_120px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)]">
        <div className="grid gap-8 p-6 md:p-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-8 flex flex-col items-start gap-4">
              <Button
                asChild
                variant="outline"
                className="rounded-2xl border-slate-300 bg-white/80 text-slate-900 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to main page
                </Link>
              </Button>
              <Badge variant="outline" className="border-slate-300 bg-white/70 dark:border-slate-700 dark:bg-slate-900/70">
                Operations Workspace
              </Badge>
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              Admin dashboard for managing your karaoke
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Use this page to register your karaoke, manage rooms, update the
              menu, and review bookings in one place.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardStats.map((stat) => {
                const Icon = stat.icon

                return (
                  <div
                    key={stat.label}
                    className="rounded-[28px] border border-slate-200 bg-white/85 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </p>
                      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold">{stat.value}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white/90 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Current karaoke
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {selectedKaraoke?.name || "No karaoke selected"}
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  void refreshKaraokes(selectedKaraoke?._id)
                  void refreshBookings()
                }}
                disabled={isRefreshing || isBookingsLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isRefreshing || isBookingsLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Owner
                </p>
                <p className="mt-2 font-semibold">{profile.fullName || "Admin account"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Address
                </p>
                <p className="mt-2 flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  {selectedKaraoke
                    ? `${selectedKaraoke.city}, ${selectedKaraoke.address}`
                    : "Register a karaoke to continue"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon

          return (
            <Card
              key={step.id}
              className="rounded-[28px] border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <CardHeader className="gap-4">
                <div className="flex items-center justify-between">
                  <Badge variant={step.complete ? "default" : "outline"}>
                    Step {index + 1}
                  </Badge>
                  {step.complete ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Icon className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription className="mt-2 text-slate-500 dark:text-slate-400">
                    {step.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Venue workspace</CardTitle>
                <CardDescription className="mt-2 text-slate-500 dark:text-slate-400">
                  Switch between karaoke locations and keep all room and menu updates
                  connected to the right venue.
                </CardDescription>
              </div>
              <div className="relative min-w-[260px]">
                <select
                  value={selectedKaraoke?._id ?? ""}
                  onChange={(event) => setSelectedKaraokeId(event.target.value)}
                  className="min-w-[260px] appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  disabled={karaokes.length === 0}
                >
                  {karaokes.length === 0 ? (
                    <option value="">Register a karaoke first</option>
                  ) : (
                    karaokes.map((karaoke) => (
                      <option key={karaoke._id} value={karaoke._id}>
                        {karaoke.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Venue
              </p>
              <p className="mt-2 font-semibold">{selectedKaraoke?.name || "-"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Hours
              </p>
              <p className="mt-2 font-semibold">{formattedSelectedHours}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Status
              </p>
              <p className="mt-2 font-semibold">
                {selectedKaraoke?.approvalStatus || profile.ownerStatus || "-"}
              </p>
            </div>
          </CardContent>

          {refreshError ? (
            <CardContent className="pt-0">
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {refreshError}
              </p>
            </CardContent>
          ) : null}
        </Card>

        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Live room load</CardTitle>
            <CardDescription className="mt-2 text-slate-500 dark:text-slate-400">
              View room demand and upcoming booked times for the selected karaoke.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedKaraoke ? (
              roomLoad.length > 0 ? (
                roomLoad.map((room) => (
                  <div
                    key={room.roomId}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{room.roomName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {room.roomType}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {room.upcomingCount} bookings
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2">
                      {room.bookedTimes.length > 0 ? (
                        room.bookedTimes.map((slot) => (
                          <div
                            key={`${room.roomId}-${slot}`}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                          >
                            <Clock3 className="h-4 w-4 text-slate-400" />
                            {slot}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No booked times yet.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  Rooms will appear here after you add them.
                </div>
              )
            ) : (
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                Register a karaoke first to unlock live room data.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle>1. Register Karaoke</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminRegister
            embedded
            currentKaraoke={selectedKaraoke}
            onRegistered={handleRegistered}
          />
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>2. Rooms Available</CardTitle>
              <CardDescription className="mt-2 text-slate-500 dark:text-slate-400">
                Room setup now uses a neutral admin style and remains readable in both
                light and dark mode.
              </CardDescription>
            </div>
            {selectedKaraoke ? <Badge variant="outline">{selectedKaraoke.name}</Badge> : null}
          </div>
        </CardHeader>
        <CardContent>
          {selectedKaraoke ? (
            <RoomsTab
              karaoke={{
                ...selectedKaraoke,
                rooms: selectedKaraoke.rooms ?? [],
                menu: selectedKaraoke.menu ?? [],
              }}
              onRefresh={() => {
                void refreshKaraokes(selectedKaraoke._id)
                void refreshBookings()
              }}
            />
          ) : (
            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              Register a karaoke first, then add its rooms here.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>3. Menu</CardTitle>
              <CardDescription className="mt-2 text-slate-500 dark:text-slate-400">
                Maintain menu items for the currently selected karaoke with the same
                admin-focused styling.
              </CardDescription>
            </div>
            {selectedKaraoke ? <Badge variant="outline">{selectedKaraoke.name}</Badge> : null}
          </div>
        </CardHeader>
        <CardContent>
          {selectedKaraoke ? (
            <MenuTab
              karaoke={{
                ...selectedKaraoke,
                rooms: selectedKaraoke.rooms ?? [],
                menu: selectedKaraoke.menu ?? [],
              }}
              onRefresh={() => void refreshKaraokes(selectedKaraoke._id)}
            />
          ) : (
            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              Register a karaoke first, then add its food and drink menu here.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Live bookings</CardTitle>
              <CardDescription className="mt-2 text-slate-500 dark:text-slate-400">
                See booked rooms, times, guests, and booking status without leaving the
                dashboard.
              </CardDescription>
            </div>
            <Badge variant="outline">{selectedBookings.length} bookings</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {bookingError}
            </p>
          ) : null}
          {!selectedKaraoke ? (
            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              Register a karaoke first to view live bookings.
            </div>
          ) : isBookingsLoading && selectedBookings.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              Loading booking data...
            </div>
          ) : selectedBookings.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              No bookings for this karaoke yet.
            </div>
          ) : (
            selectedBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{booking.customerName}</p>
                      <Badge variant="outline">{booking.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {booking.roomName} - {booking.roomType}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                        Date
                      </p>
                      <p className="mt-2 font-medium">{booking.bookingDate}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                        Booked times
                      </p>
                      <p className="mt-2 font-medium">
                        {(booking.bookingSlots?.length
                          ? booking.bookingSlots.join(", ")
                          : booking.bookingTime) || "-"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                        Guest info
                      </p>
                      <p className="mt-2 flex items-center gap-2 font-medium">
                        <Users className="h-4 w-4 text-slate-400" />
                        {booking.guestCount} guests
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {booking.customerPhone}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                        Amount
                      </p>
                      <p className="mt-2 font-medium">
                        {booking.totalAmount.toLocaleString()} MNT
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
