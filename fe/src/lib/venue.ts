// Pure helpers for opening hours, booking dates and money. No imports on purpose (see scripts/check-venue.mjs).

export function toMinutes(value?: string | null): number | null {
  const match = value?.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  return hours > 47 || minutes > 59 ? null : hours * 60 + minutes
}

export function formatMinutes(total: number): string {
  const m = ((Math.round(total) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

export function localDate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number)
  return localDate(new Date(y, m - 1, d + n))
}

// a night belongs to the date it started; 01:00 at a 16:00–05:00 venue is yesterday's night
export function nightNow(open?: string | null, close?: string | null, now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes()
  const o = toMinutes(open)
  const c = toMinutes(close)
  if (o !== null && c !== null && c <= o && minutes < c) {
    return { date: addDays(localDate(now), -1), minutes: minutes + 1440 }
  }
  return { date: localDate(now), minutes }
}

export function isOpenAt(open?: string | null, close?: string | null, now = new Date()): boolean {
  const o = toMinutes(open)
  const c = toMinutes(close)
  if (o === null || c === null) return false
  const m = now.getHours() * 60 + now.getMinutes()
  return o < c ? m >= o && m < c : m >= o || m < c
}

export function daySlots(open?: string | null, close?: string | null): { label: string; minutes: number }[] {
  const o = toMinutes(open)
  let c = toMinutes(close)
  if (o === null || c === null) return []
  if (c <= o) c += 1440
  const slots: { label: string; minutes: number }[] = []
  for (let m = o; m < c; m += 60) slots.push({ label: formatMinutes(m), minutes: m })
  return slots
}

export const formatMNT = (n: number) => "₮" + Math.round(n).toLocaleString("en-US")

const MN_WEEKDAYS = ["Ням", "Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям"]

// Hand-rolled Mongolian because Intl "mn" data is missing in many runtimes.
export function formatDate(
  date: string,
  lang: "EN" | "MN",
  opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }
): string {
  const [y, m, d] = date.split("-").map(Number)
  const value = new Date(y, m - 1, d)
  if (lang === "EN") return value.toLocaleDateString("en-US", opts)
  const day = opts.month || opts.day ? `${opts.year ? `${y} оны ` : ""}${m}-р сар ${d}` : ""
  const weekday = opts.weekday ? MN_WEEKDAYS[value.getDay()] : ""
  return [weekday, day].filter(Boolean).join(", ")
}

export function lowestPrice(rooms?: { price: number }[], fallback?: number | null): number | null {
  const prices = (rooms ?? []).map((r) => r.price).filter((p) => Number.isFinite(p))
  if (prices.length) return Math.min(...prices)
  return typeof fallback === "number" ? fallback : null
}
