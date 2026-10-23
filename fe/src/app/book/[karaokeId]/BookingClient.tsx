"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import axios from "axios"
import { CheckCircle2, Check, Clock, MapPin, Minus, Phone, Plus, Star, Utensils } from "lucide-react"

import ReviewForm from "@/_components/client/ReviewForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { api, apiError } from "@/lib/axios"
import { useLanguage } from "@/lib/language"
import { addDays, daySlots, formatDate, formatMNT, isOpenAt, nightNow } from "@/lib/venue"
import { cn } from "@/lib/utils"

type Room = { _id: string; name: string; type: string; price: number; capacity: number; image: string; isAvailable?: boolean }
type MenuItem = {
  _id: string
  name: string
  price: number
  description?: string | null
  category: "food" | "drink" | "set"
  image?: string | null
  isAvailable?: boolean
}
export type Karaoke = {
  _id: string
  name: string
  address: string
  city: string
  phone: string
  description: string
  openingTime: string
  closingTime: string
  image?: string | null
  images?: string[]
  rating?: number | null
  rooms?: Room[]
  menu?: MenuItem[]
}

const noopSubscribe = () => () => {}
const TYPE_LABELS: Record<string, [string, string]> = { Small: ["Small", "Жижиг"], Medium: ["Medium", "Дунд"], VIP: ["VIP", "VIP"] }
const CATEGORIES: { key: MenuItem["category"]; label: [string, string] }[] = [
  { key: "food", label: ["Food", "Хоол"] },
  { key: "drink", label: ["Drinks", "Ундаа"] },
  { key: "set", label: ["Sets", "Сет"] },
]

function StepHeading({ n, children }: { n: number; children: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{n}</span>
      <h2 className="text-xl font-semibold">{children}</h2>
    </div>
  )
}

export default function BookingClient({ karaoke: k }: { karaoke: Karaoke }) {
  const { t, language } = useLanguage()
  const { isSignedIn, user } = useUser()

  // Minute-resolution clock that is null during SSR, so server and client markup match.
  const minute = useSyncExternalStore(noopSubscribe, () => Math.floor(Date.now() / 60000), () => null)
  const now = useMemo(
    () => (minute === null ? null : nightNow(k.openingTime, k.closingTime, new Date(minute * 60000))),
    [minute, k.openingTime, k.closingTime]
  )

  const rooms = useMemo(() => (k.rooms ?? []).filter((r) => r.isAvailable !== false), [k.rooms])
  const menu = useMemo(() => (k.menu ?? []).filter((m) => m.isAvailable !== false), [k.menu])
  const slots = useMemo(() => daySlots(k.openingTime, k.closingTime), [k.openingTime, k.closingTime])
  const isOpen = minute === null ? false : isOpenAt(k.openingTime, k.closingTime, new Date(minute * 60000))

  const [roomId, setRoomId] = useState(rooms[0]?._id ?? "")
  const [pickedDate, setPickedDate] = useState<string | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [cart, setCart] = useState<Record<string, number>>({})
  const [form, setForm] = useState({ name: "", phone: "", guests: "2" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [taken, setTaken] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentFailed, setPaymentFailed] = useState(false)
  const nameTouched = useRef(false)

  const date = pickedDate ?? now?.date ?? null
  const room = rooms.find((r) => r._id === roomId)
  const image = k.image || k.images?.[0] || "/karaoke.jpg"

  useEffect(() => {
    if (!nameTouched.current && user?.fullName) setForm((f) => (f.name ? f : { ...f, name: user.fullName ?? "" }))
  }, [user?.fullName])

  const loadTaken = useCallback(async () => {
    if (!roomId || !date) return
    try {
      const { data } = await api.get<{ roomId: string; bookingSlots: string[] }[]>("/orders/availability", {
        params: { karaokeId: k._id, date },
      })
      setTaken(data.filter((o) => o.roomId === roomId).flatMap((o) => o.bookingSlots))
    } catch {
      setTaken([])
    }
  }, [k._id, roomId, date])

  useEffect(() => {
     
    void loadTaken()
  }, [loadTaken])

  const days = useMemo(() => (now ? Array.from({ length: 7 }, (_, i) => addDays(now.date, i)) : []), [now])
  const isPast = (minutes: number) => !!now && date === now.date && minutes < Math.floor(now.minutes / 60) * 60

  const menuLines = menu.filter((m) => cart[m._id] > 0).map((m) => ({ item: m, qty: cart[m._id] }))
  const roomTotal = room ? room.price * selectedSlots.length : 0
  const total = roomTotal + menuLines.reduce((sum, l) => sum + l.item.price * l.qty, 0)

  const changeQty = (id: string, delta: number) =>
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) }))

  function validate() {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = t("Enter your name", "Нэрээ оруулна уу")
    if (form.phone.replace(/\D/g, "").length < 8) next.phone = t("Enter a valid phone number", "Утасны дугаараа зөв оруулна уу")
    if (!selectedSlots.length) next.slots = t("Pick at least one hour", "Дор хаяж нэг цаг сонгоно уу")
    const guests = Number(form.guests)
    if (room && guests > room.capacity) next.guests = t(`This room fits up to ${room.capacity}`, `Энэ өрөөнд ${room.capacity} хүртэл хүн багтана`)
    if (!(guests >= 1)) next.guests = t("At least 1 guest", "Дор хаяж 1 зочин")
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) document.getElementById(`step-${first}`)?.scrollIntoView({ block: "center", behavior: "smooth" })
    return !Object.keys(next).length
  }

  async function pay(id: string) {
    try {
      const { data } = await api.post("/payments/create-checkout-session", { bookingId: id })
      window.location.assign(data.url)
    } catch {
      setPaymentFailed(true)
    }
  }

  async function submit() {
    if (!room || !date || !validate()) return
    setBusy(true)
    try {
      let id = orderId
      if (!id) {
        const { data } = await api.post("/orders", {
          karaokeId: k._id,
          roomId: room._id,
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
          bookingDate: date,
          bookingSlots: selectedSlots,
          guestCount: Number(form.guests),
          menuItems: menuLines.map((l) => ({ itemId: l.item._id, quantity: l.qty })),
        })
        id = data.order._id as string
        setOrderId(id)
      }
      await pay(id)
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        toast.error(t("That time was just booked. Pick another slot.", "Энэ цаг дөнгөж захиалагдлаа. Өөр цаг сонгоно уу."))
        setSelectedSlots([])
        void loadTaken()
      } else {
        toast.error(apiError(e, t("Couldn't create the booking", "Захиалга үүсгэж чадсангүй")))
      }
    } finally {
      setBusy(false)
    }
  }

  const bookLabel = busy ? t("Opening payment…", "Төлбөр рүү шилжиж байна…") : t("Book & pay", "Захиалаад төлөх")
  const openBadge = isOpen ? (
    <span className="flex items-center gap-1.5 text-live">
      <span className="size-2 rounded-full bg-live" />
      {t("Open now", "Нээлттэй")}
    </span>
  ) : null

  if (paymentFailed && room && date) {
    return (
      <main id="main" className="wrap max-w-lg pb-16 pt-28">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto size-12 text-live" />
          <h1 className="font-display text-2xl font-semibold">{t("Booking received", "Захиалга хүлээн авлаа")}</h1>
          <p className="text-sm text-muted-foreground">
            {k.name} · {room.name} · {formatDate(date, language)} · {selectedSlots.join(", ")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t(
              "Online payment isn't available right now. The venue will confirm your booking and you can pay on arrival.",
              "Онлайн төлбөр одоогоор боломжгүй. Караоке захиалгыг тань баталгаажуулах бөгөөд төлбөрөө газар дээр нь төлж болно."
            )}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {orderId && (
              <Button onClick={() => void pay(orderId)}>{t("Try payment again", "Дахин төлөх")}</Button>
            )}
            <Button variant="outline" asChild>
              <Link href={isSignedIn ? "/my-bookings" : "/"}>{isSignedIn ? t("My bookings", "Миний захиалгууд") : t("Back to venues", "Буцах")}</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main" className="pb-28 pt-16 lg:pb-0">
      <div className="wrap pt-4">
        <img src={image} alt={k.name} className="aspect-[16/9] w-full rounded-2xl object-cover md:aspect-[21/9]" />
        <h1 className="mt-5 font-display text-3xl font-semibold md:text-4xl">{k.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="size-4" />{[k.address, k.city].filter(Boolean).join(", ")}</span>
          <span className="flex items-center gap-1.5 tabular-nums"><Clock className="size-4" />{k.openingTime}–{k.closingTime}</span>
          <a href={`tel:${k.phone}`} className="flex items-center gap-1.5 hover:text-foreground"><Phone className="size-4" />{k.phone}</a>
          {k.rating != null && <span className="flex items-center gap-1.5"><Star className="size-4 fill-primary text-primary" />{k.rating}</span>}
          {openBadge}
        </div>
        <p className="mt-4 max-w-2xl text-muted-foreground">{k.description}</p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-10">
            <section>
              <StepHeading n={1}>{t("Room", "Өрөө")}</StepHeading>
              {rooms.length === 0 ? (
                <p className="text-muted-foreground">{t("No rooms listed yet", "Өрөө бүртгэгдээгүй байна")}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {rooms.map((r) => (
                    <button
                      key={r._id}
                      type="button"
                      aria-pressed={r._id === roomId}
                      onClick={() => {
                        setRoomId(r._id)
                        setSelectedSlots([])
                      }}
                      className={cn(
                        "relative rounded-2xl border bg-card p-3 text-left transition-colors",
                        r._id === roomId ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-foreground/30"
                      )}
                    >
                      <img src={r.image} alt="" className="aspect-[16/10] w-full rounded-xl object-cover" loading="lazy" />
                      {r._id === roomId && (
                        <span className="absolute right-5 top-5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-4" />
                        </span>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="font-semibold">{r.name}</span>
                        <Badge variant="outline">{t(...(TYPE_LABELS[r.type] ?? [r.type, r.type]))}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(`Up to ${r.capacity}`, `${r.capacity} хүртэл хүн`)} · <span className="tabular-nums text-foreground">{formatMNT(r.price)}</span>
                        {t(" / hr", " / цаг")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section id="step-slots">
              <StepHeading n={2}>{t("Date & time", "Огноо ба цаг")}</StepHeading>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {days.length === 0
                  ? Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-16 w-14 shrink-0 rounded-xl" />)
                  : days.map((d, i) => (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={d === date}
                        onClick={() => {
                          setPickedDate(d)
                          setSelectedSlots([])
                        }}
                        className={cn(
                          "flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border text-xs",
                          d === date ? "border-primary bg-primary/15 text-primary" : "border-border bg-card hover:border-foreground/30"
                        )}
                      >
                        <span>{i === 0 ? t("Today", "Өнөөдөр") : formatDate(d, language, { weekday: "short" })}</span>
                        <span className="text-lg font-semibold tabular-nums">{d.slice(8)}</span>
                      </button>
                    ))}
              </div>
              {slots.length === 0 ? (
                <p className="mt-4 text-muted-foreground">{t("Time slots are not available yet.", "Цагийн хуваарь бэлэн болоогүй байна.")}</p>
              ) : (
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {slots.map((s) => {
                    const booked = taken.includes(s.label)
                    const disabled = booked || isPast(s.minutes) || !room
                    const active = selectedSlots.includes(s.label)
                    return (
                      <button
                        key={s.label}
                        type="button"
                        disabled={disabled}
                        aria-pressed={active}
                        title={booked ? t("Booked", "Захиалагдсан") : undefined}
                        onClick={() => {
                          setSelectedSlots((prev) => (prev.includes(s.label) ? prev.filter((x) => x !== s.label) : [...prev, s.label].sort((a, b) => slots.findIndex((x) => x.label === a) - slots.findIndex((x) => x.label === b))))
                          setErrors((e) => ({ ...e, slots: "" }))
                        }}
                        className={cn(
                          "h-11 rounded-xl border text-sm tabular-nums transition-colors",
                          active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/30",
                          disabled && "opacity-40",
                          booked && "line-through"
                        )}
                      >
                        {s.label}
                        {s.minutes >= 1440 && <sup className="ml-0.5 text-[10px]">+1</sup>}
                      </button>
                    )
                  })}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{t("+1 = after midnight", "+1 = шөнө дундаас хойш")}</p>
              {errors.slots && <p className="mt-2 text-sm text-destructive">{errors.slots}</p>}
            </section>

            {menu.length > 0 && (
              <section>
                <StepHeading n={3}>{t("Food & drinks (optional)", "Хоол, ундаа (заавал биш)")}</StepHeading>
                <div className="space-y-6">
                  {CATEGORIES.map(({ key, label }) => {
                    const items = menu.filter((m) => m.category === key)
                    if (!items.length) return null
                    return (
                      <div key={key}>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t(...label)}</h3>
                        <div className="space-y-2">
                          {items.map((m) => (
                            <div key={m._id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                              {m.image ? (
                                <img src={m.image} alt="" className="size-14 rounded-lg object-cover" loading="lazy" />
                              ) : (
                                <span className="flex size-14 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Utensils className="size-5" /></span>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{m.name}</p>
                                {m.description && <p className="line-clamp-1 text-sm text-muted-foreground">{m.description}</p>}
                                <p className="text-sm tabular-nums">{formatMNT(m.price)}</p>
                              </div>
                              <div className="flex items-center rounded-full border border-border">
                                <Button variant="ghost" size="icon-sm" disabled={!cart[m._id]} onClick={() => changeQty(m._id, -1)} aria-label={t(`Remove one ${m.name}`, `${m.name} хасах`)}>
                                  <Minus />
                                </Button>
                                <span className="w-6 text-center text-sm tabular-nums">{cart[m._id] ?? 0}</span>
                                <Button variant="ghost" size="icon-sm" onClick={() => changeQty(m._id, 1)} aria-label={t(`Add ${m.name}`, `${m.name} нэмэх`)}>
                                  <Plus />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            <section>
              <StepHeading n={menu.length > 0 ? 4 : 3}>{t("Your details", "Таны мэдээлэл")}</StepHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                <div id="step-name" className="space-y-2">
                  <Label htmlFor="name">{t("Name", "Нэр")}</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    value={form.name}
                    aria-invalid={!!errors.name}
                    onChange={(e) => {
                      nameTouched.current = true
                      setForm({ ...form, name: e.target.value })
                    }}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div id="step-phone" className="space-y-2">
                  <Label htmlFor="phone">{t("Phone", "Утас")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    aria-invalid={!!errors.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
                <div id="step-guests" className="space-y-2">
                  <Label htmlFor="guests">{t("Guests", "Зочдын тоо")}</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={room?.capacity}
                    value={form.guests}
                    aria-invalid={!!errors.guests}
                    onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  />
                  {errors.guests && <p className="text-sm text-destructive">{errors.guests}</p>}
                </div>
              </div>
            </section>
          </div>

          <aside className="self-start lg:sticky lg:top-20">
            <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
              <h2 className="text-lg font-semibold">{t("Summary", "Захиалгын дүн")}</h2>
              {room && date ? (
                <p className="text-sm text-muted-foreground">
                  {room.name} · {formatDate(date, language)}
                  {selectedSlots.length > 0 && ` · ${selectedSlots.join(", ")}`}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{t("Pick a room and time", "Өрөө, цагаа сонгоно уу")}</p>
              )}
              {selectedSlots.length > 0 && room && (
                <div className="flex justify-between text-sm tabular-nums">
                  <span>{t(`Room × ${selectedSlots.length} h`, `Өрөө × ${selectedSlots.length} цаг`)}</span>
                  <span>{formatMNT(roomTotal)}</span>
                </div>
              )}
              {menuLines.map((l) => (
                <div key={l.item._id} className="flex justify-between text-sm tabular-nums">
                  <span>{l.item.name} × {l.qty}</span>
                  <span>{formatMNT(l.item.price * l.qty)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-semibold">{t("Total", "Нийт")}</span>
                <span className="font-display text-2xl tabular-nums">{formatMNT(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("Final total is confirmed by the server at checkout.", "Нийт дүнг төлбөрийн үед баталгаажуулна.")}
              </p>
              <Button size="lg" className="hidden w-full shadow-glow lg:inline-flex" disabled={busy || !room} onClick={() => void submit()}>
                {bookLabel}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <ReviewForm karaokeId={k._id} />

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <span className="font-display text-xl tabular-nums">{formatMNT(total)}</span>
        <Button size="lg" className="flex-1 shadow-glow" disabled={busy || !room} onClick={() => void submit()}>
          {bookLabel}
        </Button>
      </div>
    </main>
  )
}
