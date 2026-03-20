"use client"

import Navbar from "@/_components/client/navbar"
import HeroCarousel from "@/_components/client/HeroCarousel"
import FilterBar, { type FilterValues } from "@/_components/client/FilterBar"
import KaraokeCard from "@/_components/client/KaraokeCard"
import MapPreview from "@/_components/client/MapPreview"
import ReviewForm from "@/_components/client/ReviewForm"
import Footer from "@/_components/client/Footer"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { apiRootUrl } from "@/lib/api-url"

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
}

type KaraokeCardViewModel = {
  id: string
  image: string
  name: string
  location: string
  rating: number | null
  price: string
  hours: string
  roomSize: "small" | "medium" | "large" | "vip" | "all"
  isOpenNow: boolean
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

function getRoomSize(roomTypes?: string[]): "small" | "medium" | "large" | "vip" | "all" {
  const normalized = roomTypes?.map((type) => type.toLowerCase()) ?? []

  if (normalized.includes("vip")) return "vip"
  if (normalized.includes("large")) return "large"
  if (normalized.includes("medium")) return "medium"
  if (normalized.includes("small")) return "small"

  return "all"
}

function mapKaraokeToCard(karaoke: KaraokeListing): KaraokeCardViewModel {
  return {
    id: karaoke._id,
    image: karaoke.image || karaoke.images?.[0] || FALLBACK_IMAGE,
    name: karaoke.name,
    location: [karaoke.address, karaoke.city].filter(Boolean).join(", "),
    rating: karaoke.rating ?? null,
    price:
      typeof karaoke.pricePerHour === "number"
        ? `$${karaoke.pricePerHour}/hr`
        : "Contact for price",
    hours:
      karaoke.openingHours ||
      [karaoke.openingTime, karaoke.closingTime].filter(Boolean).join(" - ") ||
      "Hours not available",
    roomSize: getRoomSize(karaoke.roomTypes),
    isOpenNow: getIsOpenNow(karaoke.openingTime, karaoke.closingTime),
  }
}

const Index = () => {
  const [filters, setFilters] = useState<FilterValues>({
    priceSort: "default",
    minRating: "all",
    openNow: false,
    roomSize: "all",
  })
  const [karaokes, setKaraokes] = useState<KaraokeListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchKaraokes = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${apiRootUrl}/karaoke`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to load karaokes: ${response.status}`)
        }

        const data = (await response.json()) as { karaokes?: KaraokeListing[] }
        setKaraokes(Array.isArray(data.karaokes) ? data.karaokes : [])
      } catch (err) {
        console.error("Failed to fetch karaokes:", err)
        setError("Failed to load karaoke listings")
      } finally {
        setLoading(false)
      }
    }

    fetchKaraokes()
  }, [])

  const mappedKaraokes = useMemo(
    () => karaokes.map(mapKaraokeToCard),
    [karaokes]
  )

  const filteredSpots = useMemo(() => {
    const filtered = mappedKaraokes.filter((spot) => {
      if (
        filters.minRating !== "all" &&
        (spot.rating === null || spot.rating < Number(filters.minRating))
      ) {
        return false
      }

      if (filters.openNow && !spot.isOpenNow) {
        return false
      }

      if (filters.roomSize !== "all" && spot.roomSize !== filters.roomSize) {
        return false
      }

      return true
    })

    if (filters.priceSort === "lowToHigh") {
      return [...filtered].sort((a, b) => {
        const priceA = Number(a.price.replace(/[^\d.]/g, "")) || Number.MAX_SAFE_INTEGER
        const priceB = Number(b.price.replace(/[^\d.]/g, "")) || Number.MAX_SAFE_INTEGER
        return priceA - priceB
      })
    }

    if (filters.priceSort === "highToLow") {
      return [...filtered].sort((a, b) => {
        const priceA = Number(a.price.replace(/[^\d.]/g, "")) || -1
        const priceB = Number(b.price.replace(/[^\d.]/g, "")) || -1
        return priceB - priceA
      })
    }

    return filtered
  }, [filters, mappedKaraokes])

  const featuredSpots = useMemo(() => mappedKaraokes.slice(0, 3), [mappedKaraokes])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroCarousel />

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

      <MapPreview />

      {featuredSpots.length > 0 && (
        <section className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Featured <span className="text-primary">Karaoke</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Real listings highlighted from the current approved catalogue
            </p>
          </motion.div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSpots.map((spot, i) => (
              <KaraokeCard
                key={`featured-${spot.id}`}
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
        </section>
      )}

      <ReviewForm />
      <Footer />
    </div>
  )
}

export default Index
