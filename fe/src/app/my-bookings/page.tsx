"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CalendarDays } from "lucide-react"
import { toast } from "sonner"

import Navbar from "@/_components/client/navbar"
import Footer from "@/_components/client/Footer"
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
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { api, apiError } from "@/lib/axios"
import { useLanguage } from "@/lib/language"
import { formatDate, formatMNT, localDate } from "@/lib/venue"

type Booking = {
  _id: string
  karaokeId: string
  karaokeName: string
  karaokeImage?: string
  roomName?: string
  guestCount?: number
  bookingDate: string
  bookingSlots: string[]
  totalAmount: number
  status: string
  paymentStatus: string
}

function BookingRow({ b, upcoming, onChange }: { b: Booking; upcoming: boolean; onChange: (b: Booking) => void }) {
  const { t, language } = useLanguage()
  const [busy, setBusy] = useState(false)

  const canPay = upcoming && b.status === "pending" && b.paymentStatus === "unpaid" && b.totalAmount > 0
  const canCancel = upcoming && b.status !== "cancelled" && b.paymentStatus !== "paid"

  async function pay() {
    setBusy(true)
    try {
      const { data } = await api.post("/payments/create-checkout-session", { bookingId: b._id })
      window.location.assign(data.url)
    } catch (e) {
      toast.error(apiError(e, t("Payment is unavailable right now", "Төлбөр одоогоор боломжгүй")))
      setBusy(false)
    }
  }

  async function cancel() {
    try {
      await api.put(`/orders/${b._id}`, { status: "cancelled" })
      onChange({ ...b, status: "cancelled" })
      toast.success(t("Booking cancelled", "Захиалга цуцлагдлаа"))
    } catch (e) {
      toast.error(apiError(e, t("Couldn't cancel", "Цуцалж чадсангүй")))
    }
  }

  return (
    <article className="flex gap-4 rounded-2xl border border-border bg-card p-4">
      <img
        src={b.karaokeImage || "/karaoke.jpg"}
        alt=""
        className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{b.karaokeName}</h3>
        <p className="text-sm tabular-nums text-muted-foreground">
          {formatDate(b.bookingDate, language)} · {b.bookingSlots.join(", ")}
        </p>
        <p className="text-sm text-muted-foreground">
          {b.roomName} · {t(`${b.guestCount ?? 1} guests`, `${b.guestCount ?? 1} хүн`)}
        </p>
        <p className="mt-1 font-display tabular-nums">{formatMNT(b.totalAmount)}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusBadge status={b.status} />
          <PaymentBadge status={b.paymentStatus} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {canPay && (
            <Button size="sm" disabled={busy} onClick={() => void pay()}>
              {t("Pay now", "Төлөх")}
            </Button>
          )}
          {canCancel && (
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
                  <AlertDialogAction onClick={() => void cancel()}>{t("Cancel booking", "Цуцлах")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/book/${b.karaokeId}`}>{t("Venue", "Караоке")}</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

function MyBookingsContent() {
  const { t } = useLanguage()
  const paid = useSearchParams().get("payment") === "success"
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    api
      .get<Booking[]>("/orders", { params: { scope: "my" } })
      .then((res) => setBookings(res.data))
      .catch(() => setFailed(true))
  }, [])

  const { upcoming, past } = useMemo(() => {
    const today = localDate()
    const all = bookings ?? []
    // ponytail: by calendar date; after-midnight slots count as the night they started
    const isUpcoming = (b: Booking) => b.status !== "cancelled" && b.bookingDate >= today
    return {
      upcoming: all.filter(isUpcoming).sort((a, b) => a.bookingDate.localeCompare(b.bookingDate)),
      past: all.filter((b) => !isUpcoming(b)),
    }
  }, [bookings])

  const replace = (next: Booking) => setBookings((prev) => (prev ?? []).map((b) => (b._id === next._id ? next : b)))

  return (
    <main id="main" className="wrap max-w-3xl pb-16 pt-24">
      <h1 className="font-display text-3xl font-semibold">{t("My bookings", "Миний захиалгууд")}</h1>

      {paid && (
        <p className="mt-4 rounded-xl bg-live/15 p-3 text-sm text-live">
          {t("Payment received — you're booked.", "Төлбөр амжилттай — захиалга баталгаажлаа.")}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {failed ? (
          <p className="text-destructive">{t("Couldn't load your bookings", "Захиалгуудыг ачаалж чадсангүй")}</p>
        ) : bookings === null ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
        ) : bookings.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><CalendarDays /></EmptyMedia>
              <EmptyTitle>{t("No bookings yet", "Захиалга алга")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild><Link href="/">{t("Find a venue", "Караоке хайх")}</Link></Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            {upcoming.map((b) => <BookingRow key={b._id} b={b} upcoming onChange={replace} />)}
            {past.length > 0 && (
              <>
                <h2 className="pt-6 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("Past", "Өнгөрсөн")}</h2>
                {past.map((b) => <BookingRow key={b._id} b={b} upcoming={false} onChange={replace} />)}
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default function MyBookingsPage() {
  return (
    <>
      <Navbar />
      <Suspense>
        <MyBookingsContent />
      </Suspense>
      <Footer />
    </>
  )
}
