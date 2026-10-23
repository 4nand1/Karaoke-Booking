"use client"

import { MapContainer, TileLayer, type MapContainerProps } from "react-leaflet"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// ponytail: replaces the 1.5k-line shadcn-map; re-add draw/cluster only if a feature needs it
export function Map({ className, ...props }: MapContainerProps) {
  return <MapContainer zoomControl className={cn("z-0 h-full w-full", className)} {...props} />
}

export function MapTileLayer() {
  const { resolvedTheme } = useTheme()
  const variant = resolvedTheme === "dark" ? "dark_all" : "light_all"
  return (
    <TileLayer
      key={variant}
      url={`https://{s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}{r}.png`}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    />
  )
}
