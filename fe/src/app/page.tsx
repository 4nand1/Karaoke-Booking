"use client"

import Navbar from "@/_components/client/navbar"
import HeroCarousel from "@/_components/client/HeroCarousel"
import FilterBar, { type FilterValues } from "@/_components/client/FilterBar"
import KaraokeCard from "@/_components/client/KaraokeCard"
import MapPreview from "@/_components/client/MapPreviewClient"
import ReviewForm from "@/_components/client/ReviewForm"
import Footer from "@/_components/client/Footer"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { apiRootUrl } from "@/lib/api-url"
import SiteReviews from "@/_components/client/SiteReviews"

type KaraokeListing = {
  _id: string
  name: string
  address: string
  city: string
  description: string
  openingHours?: string
  openingTime?: string
  closingTime?: string
  roomTypes?: string[]
  pricePerHour?: number | null
  capacity?: number | null
  amenities?: string[]
  images?: string[]
  image?: string | null
  approvalStatus: "pending" | "approved" | "rejected" | "draft"
  rating?: number | null
  rooms?: Array<{
    _id: string
    name: string
    type: string
    price: number
    capacity: number
    image: string
  }>
}

type KaraokeCardViewModel = {
  id: string
  image: string
  name: string
  location: string
  rating: number | null
  price: string
  startingPrice: number | null
  hours: string
  roomSizes: Array<"small" | "large" | "vip">
  isOpenNow: boolean
  rooms: Array<{
    _id: string
    name: string
    type: string
    price: number
    capacity: number
    image: string
  }>
}

type ReviewRecord = {
  karaokeId?: string
  rating?: number
}

const FALLBACK_IMAGE = "/karaoke-card-1.jpg"

function toMinutes(value?: string) {
  if (!value || !value.includes(":")) return null
  const [hours, minutes] = value.split(":").map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

function getIsOpenNow(openingTime?: string, closingTime?: string) {
  const open = toMinutes(openingTime)
  const close = toMinutes(closingTime)

  if (open === null || close === null) return false

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (open <= close) {
    return currentMinutes >= open && currentMinutes <= close
  }

  return currentMinutes >= open || currentMinutes <= close
}

function getRoomSizes(
  karaoke: Pick<KaraokeListing, "roomTypes" | "rooms" | "capacity">
): Array<"small" | "large" | "vip"> {
  const sizes = new Set<"small" | "large" | "vip">()

  const addFromText = (value?: string | null, capacity?: number | null) => {
    const normalized = value?.trim().toLowerCase() ?? ""

    if (normalized.includes("vip")) {
      sizes.add("vip")
      return
    }

    if (normalized.includes("large")) {
      sizes.add("large")
      return
    }

    if (normalized.includes("small")) {
      sizes.add("small")
      return
    }

    if (normalized.includes("medium")) {
      sizes.add((capacity ?? karaoke.capacity ?? 0) >= 8 ? "large" : "small")
      return
    }

    if (typeof capacity === "number") {
      sizes.add(capacity >= 8 ? "large" : "small")
    }
  }

  karaoke.roomTypes?.forEach((roomType) => addFromText(roomType, karaoke.capacity))
  karaoke.rooms?.forEach((room) => addFromText(room.type, room.capacity))

  if (sizes.size === 0 && typeof karaoke.capacity === "number") {
    sizes.add(karaoke.capacity >= 8 ? "large" : "small")
  }

  return Array.from(sizes)
}

function mapKaraokeToCard(karaoke: KaraokeListing): KaraokeCardViewModel {
  const lowestRoomPrice =
    karaoke.rooms && karaoke.rooms.length > 0
      ? Math.min(...karaoke.rooms.map((room) => room.price))
      : null

  return {
    id: karaoke._id,
    image: karaoke.image || karaoke.images?.[0] || FALLBACK_IMAGE,
    name: karaoke.name,
    location: [karaoke.address, karaoke.city].filter(Boolean).join(", "),
    rating: karaoke.rating ?? null,
    price:
      typeof karaoke.pricePerHour === "number"
        ? `$${karaoke.pricePerHour}/hr`
        : typeof lowestRoomPrice === "number" && Number.isFinite(lowestRoomPrice)
          ? `₮${lowestRoomPrice.toLocaleString()}/hr`
        : "Contact for price",
    startingPrice:
      typeof karaoke.pricePerHour === "number"
        ? karaoke.pricePerHour
        : typeof lowestRoomPrice === "number" && Number.isFinite(lowestRoomPrice)
          ? lowestRoomPrice
          : null,
    hours:
      karaoke.openingHours ||
      [karaoke.openingTime, karaoke.closingTime].filter(Boolean).join(" - ") ||
      "Hours not available",
    roomSizes: getRoomSizes(karaoke),
    isOpenNow: getIsOpenNow(karaoke.openingTime, karaoke.closingTime),
    rooms: karaoke.rooms ?? [],
  }
}

const Index = () => {
  const [filters, setFilters] = useState<FilterValues>({
    minPrice: "",
    maxPrice: "",
    minRating: 0,
    openNow: false,
    roomSize: "all",
  })
  const [karaokes, setKaraokes] = useState<KaraokeListing[]>([])
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchKaraokes = async () => {
      try {
        setLoading(true)
        setError("")

        const [karaokeResponse, reviewResponse] = await Promise.all([
          fetch(`${apiRootUrl}/karaoke`, {
            cache: "no-store",
          }),
          fetch(`${apiRootUrl}/api/reviews`, {
            cache: "no-store",
          }),
        ])

        if (!karaokeResponse.ok) {
          throw new Error(`Failed to load karaokes: ${karaokeResponse.status}`)
        }

        const karaokeData = (await karaokeResponse.json()) as {
          karaokes?: KaraokeListing[]
        }
        setKaraokes(Array.isArray(karaokeData.karaokes) ? karaokeData.karaokes : [])

        if (reviewResponse.ok) {
          const reviewData = (await reviewResponse.json()) as {
            data?: ReviewRecord[]
          }
          setReviews(Array.isArray(reviewData.data) ? reviewData.data : [])
        } else {
          setReviews([])
        }
      } catch (err) {
        console.error("Failed to fetch karaokes:", err)
        setError("Failed to load karaoke listings")
      } finally {
        setLoading(false)
      }
    }

    fetchKaraokes()
  }, [])

  const ratingByKaraokeId = useMemo(() => {
    const totals = new Map<string, { sum: number; count: number }>()

    reviews.forEach((review) => {
      if (
        typeof review.karaokeId !== "string" ||
        typeof review.rating !== "number" ||
        review.rating < 1 ||
        review.rating > 5
      ) {
        return
      }

      const current = totals.get(review.karaokeId) ?? { sum: 0, count: 0 }
      current.sum += review.rating
      current.count += 1
      totals.set(review.karaokeId, current)
    })

    return totals
  }, [reviews])

  const mappedKaraokes = useMemo(
    () =>
      karaokes.map((karaoke) => {
        const reviewSummary = ratingByKaraokeId.get(karaoke._id)
        const computedRating =
          reviewSummary && reviewSummary.count > 0
            ? Number((reviewSummary.sum / reviewSummary.count).toFixed(1))
            : karaoke.rating ?? null

        return mapKaraokeToCard({
          ...karaoke,
          rating: computedRating,
        })
      }),
    [karaokes, ratingByKaraokeId]
  )

  const filteredSpots = useMemo(() => {
    const minPrice = Number(filters.minPrice)
    const maxPrice = Number(filters.maxPrice)
    const hasMinPrice = filters.minPrice.trim() !== "" && !Number.isNaN(minPrice)
    const hasMaxPrice = filters.maxPrice.trim() !== "" && !Number.isNaN(maxPrice)

    const filtered = mappedKaraokes.filter((spot) => {
      if (
        filters.minRating > 0 &&
        (spot.rating === null || spot.rating < filters.minRating)
      ) {
        return false
      }

      if (filters.openNow && !spot.isOpenNow) {
        return false
      }

      if (
        filters.roomSize !== "all" &&
        !spot.roomSizes.includes(filters.roomSize)
      ) {
        return false
      }

      if (hasMinPrice && (spot.startingPrice === null || spot.startingPrice < minPrice)) {
        return false
      }

      if (hasMaxPrice && (spot.startingPrice === null || spot.startingPrice > maxPrice)) {
        return false
      }

      return true
    })

    return filtered
  }, [filters, mappedKaraokes])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroCarousel />
      <MapPreview />

      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Popular Karaoke <span className="text-primary">Spots</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            Approved karaoke listings from real owners on the platform
          </p>
        </motion.div>

        <FilterBar onChange={setFilters} />

        {loading ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-muted-foreground">
            Loading karaoke listings...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
            {error}
          </div>
        ) : filteredSpots.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-muted-foreground">
            No karaoke listings found.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSpots.map((spot, i) => (
              <KaraokeCard
                key={spot.id}
                id={spot.id}
                image={spot.image}
                name={spot.name}
                location={spot.location}
                rating={spot.rating}
                price={spot.price}
                hours={spot.hours}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
<SiteReviews/>
    
      <Footer />
    </div>
  )
}

export default Index
