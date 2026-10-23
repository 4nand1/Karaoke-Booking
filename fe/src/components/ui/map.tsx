"use client"

import { MapContainer, TileLayer, type MapContainerProps } from "react-leaflet"
import { cn } from "@/lib/utils"

// ponytail: replaces the 1.5k-line shadcn-map; re-add draw/cluster only if a feature needs it
export function Map({ className, ...props }: MapContainerProps) {
  return <MapContainer zoomControl className={cn("z-0 h-full w-full", className)} {...props} />
}

// CARTO's free basemaps now demand an API key, so default to OpenStreetMap (fine for low traffic).
// ponytail: set NEXT_PUBLIC_MAP_TILE_URL (e.g. a MapTiler/Stadia key URL) before heavy production traffic.
const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

export function MapTileLayer() {
  return (
    <TileLayer
      url={TILE_URL}
      maxZoom={19}
      // raster tiles are light-only, so darken them in dark mode
      className="dark:[filter:invert(1)_hue-rotate(180deg)_brightness(.9)_contrast(.9)_saturate(.7)]"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
  )
}
