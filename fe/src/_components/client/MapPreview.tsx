"use client"

import { useEffect, useMemo, useState } from "react"
import { Marker } from "react-leaflet"
import { LocateFixed } from "lucide-react"
import { toast } from "sonner"

import { Map, MapTileLayer } from "@/components/ui/map"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { apiBaseUrl } from "@/lib/api-url"
import { useLanguage } from "@/lib/language"
import MapAutoFit, { MapFocus } from "./MapAutoFit"
import NearbyKaraokeCard from "./map-preview/NearbyKaraokeCard"
import { createKaraokeIcon, createUserIcon } from "./map-preview/icons"
import type { Karaoke, Order, UserLocation } from "./map-preview/types"
import { getFitPoints, getNearbyKaraokes, getNowState } from "./map-preview/utils"

export default function MapPreview() {
  const { t } = useLanguage()
  const [karaokes, setKaraokes] = useState<Karaoke[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locating, setLocating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [karaokeRes, orderRes] = await Promise.all([
          fetch(`${apiBaseUrl}/karaoke`),
          fetch(`${apiBaseUrl}/orders/availability`),
        ])
        if (karaokeRes.ok) setKaraokes(((await karaokeRes.json()) as { karaokes?: Karaoke[] }).karaokes ?? [])
        if (orderRes.ok) setOrders((await orderRes.json()) as Order[])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const venues = useMemo(() => getNearbyKaraokes(karaokes, userLocation), [karaokes, userLocation])
  const fitPoints = useMemo(() => getFitPoints(venues, userLocation), [venues, userLocation])
  const selected = venues.find((v) => v._id === selectedId)
  const focus: [number, number] | null = selected ? [selected.latitude!, selected.longitude!] : null

  function locate() {
    if (!navigator.geolocation) {
      toast.error(t("Couldn't get your location", "Байршил тодорхойлж чадсангүй"))
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        toast.error(t("Couldn't get your location", "Байршил тодорхойлж чадсангүй"))
        setLocating(false)
      }
    )
  }

  function select(id: string) {
    setSelectedId(id)
    document.getElementById(`venue-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }

  return (
    <main id="main" className="pt-16">
      <div className="wrap flex flex-wrap items-center justify-between gap-3 py-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t("Map", "Газрын зураг")}</h1>
          <p className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-live" />{t("Free now", "Одоо сул")}</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary" />{t("Busy or closed", "Завгүй эсвэл хаалттай")}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={locate} disabled={locating}>
          {locating ? (
            <span className="eq" aria-hidden><span /><span /><span /></span>
          ) : (
            <LocateFixed />
          )}
          {t("Near me", "Миний ойролцоо")}
        </Button>
      </div>

      <div className="wrap grid gap-4 pb-16 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="order-1 h-[55svh] overflow-hidden rounded-2xl border border-border lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100svh-9rem)]">
          <Map center={[47.9186, 106.9177]} zoom={12}>
            <MapTileLayer />
            <MapAutoFit points={fitPoints} />
            <MapFocus point={focus} />
            {venues.map((venue) => (
              <Marker
                key={venue._id}
                position={[venue.latitude!, venue.longitude!]}
                icon={createKaraokeIcon(venue._id === selectedId, getNowState(venue, orders).state === "free")}
                eventHandlers={{ click: () => select(venue._id) }}
              />
            ))}
            {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={createUserIcon()} />}
          </Map>
        </div>

        <div className="order-2 space-y-3 lg:order-1">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : venues.length === 0 ? (
            <p className="text-muted-foreground">{t("No venues on the map yet", "Газрын зураг дээр караоке алга")}</p>
          ) : (
            venues.map((venue) => (
              <NearbyKaraokeCard
                key={venue._id}
                karaoke={venue}
                orders={orders}
                isSelected={venue._id === selectedId}
                onSelect={() => select(venue._id)}
              />
            ))
          )}
        </div>
      </div>
    </main>
  )
}
