"use client"

import Link from "next/link"
import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, SearchX, WifiOff, X } from "lucide-react"
import Navbar from "@/_components/client/navbar"
import Hero from "@/_components/client/Hero"
import FilterBar, { defaultFilters, type FilterValues } from "@/_components/client/FilterBar"
import KaraokeCard from "@/_components/client/KaraokeCard"
import Footer from "@/_components/client/Footer"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { apiBaseUrl } from "@/lib/api-url"
import { useLanguage } from "@/lib/language"
import { formatDisplayLocation } from "@/lib/location"
import { isOpenAt, lowestPrice } from "@/lib/venue"

type Room = { _id: string; name: string; type: string; price: number; capacity: number; image: string }

type KaraokeListing = {
  _id: string
  name: string
  address: string
  city: string
  openingTime?: string
  closingTime?: string
  pricePerHour?: number | null
  images?: string[]
  image?: string | null
  rating?: number | null
  rooms?: Room[]
}

type ReviewRecord = { karaokeId?: string; rating?: number }

const FALLBACK_IMAGE = "/karaoke-card-1.jpg"

const PRICE_RANGES: Record<Exclude<FilterValues["price"], "all">, (p: number) => boolean> = {
  lt50: (p) => p < 50000,
  "50to80": (p) => p >= 50000 && p <= 80000,
  gt80: (p) => p > 80000,
}

function IndexContent() {
  const router = useRouter()
  const { t } = useLanguage()
  const searchQuery = (useSearchParams().get("q") ?? "").trim()
  const [filters, setFilters] = useState<FilterValues>(defaultFilters)
  const [karaokes, setKaraokes] = useState<KaraokeListing[]>([])
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [karaokeRes, reviewRes] = await Promise.all([
        fetch(`${apiBaseUrl}/karaoke`, { cache: "no-store" }),
        fetch(`${apiBaseUrl}/reviews`, { cache: "no-store" }),
      ])
      if (!karaokeRes.ok) throw new Error(String(karaokeRes.status))
      setKaraokes(((await karaokeRes.json()) as { karaokes?: KaraokeListing[] }).karaokes ?? [])
      setReviews(reviewRes.ok ? (((await reviewRes.json()) as { data?: ReviewRecord[] }).data ?? []) : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
     
    void load()
  }, [load])

  const venues = useMemo(() => {
    const totals = new Map<string, { sum: number; count: number }>()
    for (const review of reviews) {
      if (typeof review.karaokeId !== "string" || !(Number(review.rating) >= 1 && Number(review.rating) <= 5)) continue
      const entry = totals.get(review.karaokeId) ?? { sum: 0, count: 0 }
      entry.sum += Number(review.rating)
      entry.count += 1
      totals.set(review.karaokeId, entry)
    }

    return karaokes.map((k) => {
      const summary = totals.get(k._id)
      const rooms = k.rooms ?? []
      return {
        id: k._id,
        image: k.image || k.images?.[0] || FALLBACK_IMAGE,
        name: k.name,
        location: formatDisplayLocation(k.address, k.city),
        rating: summary ? Number((summary.sum / summary.count).toFixed(1)) : (k.rating ?? null),
        price: lowestPrice(rooms, k.pricePerHour),
        openingTime: k.openingTime,
        closingTime: k.closingTime,
        isOpen: isOpenAt(k.openingTime, k.closingTime),
        roomTypes: [...new Set(rooms.map((r) => r.type))],
        searchText: [k.name, k.address, k.city, ...rooms.map((r) => r.name)].join(" ").toLowerCase(),
      }
    })
  }, [karaokes, reviews])

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return venues.filter((v) => {
      if (filters.openNow && !v.isOpen) return false
      if (filters.roomType !== "all" && !v.roomTypes.includes(filters.roomType)) return false
      if (filters.price !== "all" && (v.price === null || !PRICE_RANGES[filters.price](v.price))) return false
      return !q || v.searchText.includes(q)
    })
  }, [venues, filters, searchQuery])

  return (
    <>
      <Navbar />
      <main id="main">
        <Hero total={venues.length} openNow={venues.filter((v) => v.isOpen).length} />

        <section id="venues" className="wrap scroll-mt-20 py-10 md:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {t("Venues", "Караокенууд")}
              </h2>
              <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                {t(`${filtered.length} venues`, `${filtered.length} караоке`)}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/map">
                <MapPin /> {t("Map view", "Газрын зураг")}
              </Link>
            </Button>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label={t("Clear search", "Хайлт арилгах")}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm hover:bg-muted"
            >
              “{searchQuery}” <X className="size-3.5" />
            </button>
          )}

          <FilterBar value={filters} onChange={setFilters} />

          <div className="mt-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <Skeleton className="aspect-[4/3] rounded-none" />
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon"><WifiOff /></EmptyMedia>
                  <EmptyTitle>{t("Couldn't load venues", "Караокенуудыг ачаалж чадсангүй")}</EmptyTitle>
                  <EmptyDescription>{t("Check your connection and try again.", "Интернэтээ шалгаад дахин оролдоно уу.")}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => void load()}>{t("Try again", "Дахин оролдох")}</Button>
                </EmptyContent>
              </Empty>
            ) : filtered.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon"><SearchX /></EmptyMedia>
                  <EmptyTitle>{t("No venues match", "Тохирох караоке олдсонгүй")}</EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters(defaultFilters)
                      if (searchQuery) router.push("/")
                    }}
                  >
                    {t("Clear filters", "Шүүлтүүр арилгах")}
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((v, i) => (
                  <KaraokeCard key={v.id} {...v} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="wrap pb-16">
          <div className="rounded-2xl border border-border bg-card p-6 md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t("For owners", "Эзэмшигчдэд")}
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold">
                {t("Own a karaoke? List it free.", "Караоке эзэмшдэг үү? Үнэгүй бүртгүүлээрэй.")}
              </h3>
            </div>
            <Button asChild className="mt-4 md:mt-0">
              <Link href="/sign-up?role=admin">{t("List your venue", "Бүртгүүлэх")}</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default function Index() {
  return (
    <Suspense>
      <IndexContent />
    </Suspense>
  )
}
