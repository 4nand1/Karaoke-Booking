"use client"

import { Marker, useMapEvents } from "react-leaflet"
import { Map, MapTileLayer } from "@/components/ui/map"
import { createKaraokeIcon } from "@/_components/client/map-preview/icons"
import MapAutoFit from "@/_components/client/MapAutoFit"

const ULAANBAATAR: [number, number] = [47.9186, 106.9177]

function ClickToPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

// Click the map to place the venue; the lat/lng inputs stay in sync via onPick.
export default function LocationPicker({
  latitude,
  longitude,
  onPick,
}: {
  latitude: number | null
  longitude: number | null
  onPick: (lat: number, lng: number) => void
}) {
  const point: [number, number] | null = latitude !== null && longitude !== null ? [latitude, longitude] : null

  return (
    <div className="h-64 overflow-hidden rounded-xl border border-border">
      <Map center={point ?? ULAANBAATAR} zoom={point ? 15 : 12}>
        <MapTileLayer />
        <ClickToPick onPick={onPick} />
        {point && (
          <>
            <Marker position={point} icon={createKaraokeIcon(true, false)} />
            <MapAutoFit points={[point]} maxZoom={16} />
          </>
        )}
      </Map>
    </div>
  )
}
