"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/_components/client/navbar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, MapPin, Clock, Phone } from "lucide-react"
import { api } from "@/lib/axios"

type KaraokeDetail = {
  _id: string
  name: string
  address: string
  city: string
  phone: string
  description: string
  image?: string | null
  images?: string[]
  openingHours?: string
  openingTime?: string
  closingTime?: string
  amenities?: string[]
  pricePerHour?: number | null
  capacity?: number | null
}

export default function KaraokePage() {
  const router = useRouter()
  const params = useParams<{ karaokeId: string }>()
  const karaokeId = params?.karaokeId

  const [karaoke, setKaraoke] = useState<KaraokeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchKaraoke = async () => {
      try {
        setLoading(true)
        setError("")

        const { data } = await api.get(`/karaoke/${karaokeId}`)
        setKaraoke(data?.karaoke ?? null)
      } catch (err) {
        console.error("Failed to fetch karaoke:", err)
        setError("Failed to load karaoke details")
      } finally {
        setLoading(false)
      }
    }

    if (karaokeId) {
      fetchKaraoke()
    }
  }, [karaokeId])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => router.push("/")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">
            Loading karaoke details...
          </div>
        ) : error || !karaoke ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
            {error || "Karaoke not found"}
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <img
                src={karaoke.image || karaoke.images?.[0] || "/karaoke-card-1.jpg"}
                alt={karaoke.name}
                className="h-[420px] w-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold">{karaoke.name}</h1>

              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {[karaoke.address, karaoke.city].filter(Boolean).join(", ")}
              </p>

              <p className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {karaoke.openingHours ||
                  [karaoke.openingTime, karaoke.closingTime]
                    .filter(Boolean)
                    .join(" - ") ||
                  "Hours not available"}
              </p>

              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {karaoke.phone}
              </p>

              {typeof karaoke.pricePerHour === "number" && (
                <p className="text-lg font-semibold text-primary">
                  ${karaoke.pricePerHour}/hr
                </p>
              )}

              <p className="text-base leading-7 text-foreground/90">
                {karaoke.description}
              </p>

              {karaoke.amenities && karaoke.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {karaoke.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}