"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RefreshCw, Store } from "lucide-react"
import { toast } from "sonner"

import KaraokeRegisterForm, { type RegisteredKaraoke } from "./AdminRegister"
import { MenuTab } from "./MenuTab"
import { RoomsTab } from "./RoomsTab"
import { PaymentBadge, StatusBadge } from "@/_components/client/StatusBadge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api, apiError } from "@/lib/axios"
import { useLanguage } from "@/lib/language"
import { formatDate, formatMNT, localDate, nightNow } from "@/lib/venue"
import { cn } from "@/lib/utils"

type Booking = {
  _id: string
  karaokeId: string
  roomName?: string
  roomType?: string
  customerName: string
  customerPhone: string
  bookingDate: string
  bookingSlots: string[]
  guestCount: number
  totalAmount: number
  status: "pending" | "confirmed" | "cancelled"
  paymentStatus: string
}

type Filter = "upcoming" | "past" | "cancelled"

const APPROVAL: Record<string, [string, [string, string]]> = {
  pending: ["bg-warning/15 text-warning", ["In review", "Хянагдаж байна"]],
  approved: ["bg-live/15 text-live", ["Live", "Нийтлэгдсэн"]],
  rejected: ["bg-destructive/15 text-destructive", ["Rejected", "Татгалзсан"]],
}

export function UnifiedAdminDashboard({ initialKaraokes = [] }: { profile?: unknown; initialKaraokes?: RegisteredKaraoke[] }) {
  const { t, language } = useLanguage()
  const [karaokes, setKaraokes] = useState(initialKaraokes)
  const [selectedId, setSelectedId] = useState(initialKaraokes[0]?._id ?? "")
  const [refreshing, setRefreshing] = useState(false)
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [filter, setFilter] = useState<Filter>("upcoming")

  const karaoke = karaokes.find((k) => k._id === selectedId) ?? karaokes[0] ?? null

  async function refreshKaraokes(nextId?: string) {
    setRefreshing(true)
    try {
      const { data } = await api.get<{ karaokes?: RegisteredKaraoke[] }>("/karaoke/mine")
      const list = data.karaokes ?? []
      setKaraokes(list)
      setSelectedId(list.find((k) => k._id === (nextId ?? selectedId))?._id ?? list[0]?._id ?? "")
    } catch (e) {
      if (!(e as { response?: { status?: number } }).response || (e as { response: { status: number } }).response.status !== 404) {
        toast.error(apiError(e, t("Couldn't refresh", "Шинэчилж чадсангүй")))
      }
    } finally {
      setRefreshing(false)
    }
  }

  const loadBookings = useCallback(async () => {
    if (!karaoke?._id) return
    try {
      const { data } = await api.get<Booking[]>("/orders", { params: { karaokeId: karaoke._id } })
      setBookings(data)
    } catch (e) {
      toast.error(apiError(e, t("Couldn't load bookings", "Захиалгыг ачаалж чадсангүй")))
      setBookings([])
    }
  }, [karaoke?._id, t])

  useEffect(() => {
     
    void loadBookings()
    const id = window.setInterval(() => void loadBookings(), 30000)
    return () => window.clearInterval(id)
  }, [loadBookings])

  async function setStatus(b: Booking, status: "confirmed" | "cancelled") {
    try {
      await api.put(`/orders/${b._id}`, { status })
      setBookings((prev) => (prev ?? []).map((x) => (x._id === b._id ? { ...x, status } : x)))
      toast.success(status === "confirmed" ? t("Booking confirmed", "Захиалга батлагдлаа") : t("Booking cancelled", "Захиалга цуцлагдлаа"))
    } catch (e) {
      toast.error(apiError(e, t("Couldn't update the booking", "Захиалгыг шинэчилж чадсангүй")))
    }
  }

  const today = karaoke ? nightNow(karaoke.openingTime, karaoke.closingTime).date : localDate()
  const visible = useMemo(() => {
    const all = bookings ?? []
    const upcoming = (b: Booking) => b.status !== "cancelled" && b.bookingDate >= today
    if (filter === "cancelled") return all.filter((b) => b.status === "cancelled")
    if (filter === "past") return all.filter((b) => b.status !== "cancelled" && !upcoming(b))
    return all.filter(upcoming).sort((a, b) => a.bookingDate.localeCompare(b.bookingDate))
  }, [bookings, filter, today])

  if (!karaoke) {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("Venue dashboard", "Удирдлагын самбар")}</p>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">{t("Register your venue", "Караокегоо бүртгүүлэх")}</h1>
        </header>
        <KaraokeRegisterForm onRegistered={(k) => void refreshKaraokes(k._id)} />
      </div>
    )
  }

  const stats = [
    { label: t("Today", "Өнөөдөр"), value: (bookings ?? []).filter((b) => b.status !== "cancelled" && b.bookingDate === today).length },
    { label: t("Pending", "Хүлээгдэж буй"), value: (bookings ?? []).filter((b) => b.status === "pending").length },
    { label: t("Rooms", "Өрөө"), value: karaoke.rooms?.length ?? 0 },
    { label: t("Menu", "Меню"), value: karaoke.menu?.length ?? 0 },
  ]
  const [approvalClass, approvalLabel] = APPROVAL[karaoke.approvalStatus ?? "pending"] ?? APPROVAL.pending

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("Venue dashboard", "Удирдлагын самбар")}</p>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">{karaoke.name}</h1>
          <Badge className={cn("mt-2 rounded-full", approvalClass)}>{t(...approvalLabel)}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {karaokes.length > 1 && (
            <select
              value={karaoke._id}
              onChange={(e) => setSelectedId(e.target.value)}
              aria-label={t("Venue", "Караоке")}
              className="h-11 rounded-xl border border-input bg-card px-4 text-sm"
            >
              {karaokes.map((k) => (
                <option key={k._id} value={k._id}>{k.name}</option>
              ))}
            </select>
          )}
          <Button variant="ghost" size="icon" aria-label={t("Refresh", "Шинэчлэх")} onClick={() => void Promise.all([refreshKaraokes(), loadBookings()])}>
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
          </Button>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="bookings" className="mt-8">
        <TabsList variant="line" className="no-scrollbar max-w-full overflow-x-auto">
          <TabsTrigger value="bookings">{t("Bookings", "Захиалга")}</TabsTrigger>
          <TabsTrigger value="rooms">{t("Rooms", "Өрөө")}</TabsTrigger>
          <TabsTrigger value="menu">{t("Menu", "Меню")}</TabsTrigger>
          <TabsTrigger value="info">{t("Venue info", "Мэдээлэл")}</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6 space-y-3">
          <div className="flex gap-2">
            {(
              [
                ["upcoming", t("Upcoming", "Удахгүй")],
                ["past", t("Past", "Өнгөрсөн")],
                ["cancelled", t("Cancelled", "Цуцлагдсан")],
              ] as [Filter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                  filter === key ? "border-primary bg-primary/15 text-primary" : "border-border bg-card hover:border-foreground/30"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {bookings === null ? (
            Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : visible.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><Store /></EmptyMedia>
                <EmptyTitle>{t("No bookings here yet", "Захиалга алга")}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            visible.map((b) => (
              <article key={b._id} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{b.customerName}</h3>
                    <StatusBadge status={b.status} />
                    <PaymentBadge status={b.paymentStatus} />
                  </div>
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {formatDate(b.bookingDate, language)} · {b.bookingSlots.join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {b.roomName} ({b.roomType}) · {t(`${b.guestCount} guests`, `${b.guestCount} хүн`)} ·{" "}
                    <a href={`tel:${b.customerPhone}`} className="hover:text-foreground">{b.customerPhone}</a>
                  </p>
                  <p className="font-display tabular-nums">{formatMNT(b.totalAmount)}</p>
                </div>
                {filter === "upcoming" && (
                  <div className="flex gap-2">
                    {b.status === "pending" && (
                      <Button size="sm" onClick={() => void setStatus(b, "confirmed")}>{t("Confirm", "Батлах")}</Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">{t("Cancel", "Цуцлах")}</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("Cancel this booking?", "Захиалгыг цуцлах уу?")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("The time slot will be released.", "Цаг чөлөөлөгдөнө.")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("Keep it", "Болих")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => void setStatus(b, "cancelled")}>{t("Cancel booking", "Цуцлах")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </article>
            ))
          )}
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          <RoomsTab karaoke={karaoke} onRefresh={() => void refreshKaraokes()} />
        </TabsContent>
        <TabsContent value="menu" className="mt-6">
          <MenuTab karaoke={karaoke} onRefresh={() => void refreshKaraokes()} />
        </TabsContent>
        <TabsContent value="info" className="mt-6">
          <KaraokeRegisterForm key={karaoke._id} currentKaraoke={karaoke} onRegistered={(k) => void refreshKaraokes(k._id)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
