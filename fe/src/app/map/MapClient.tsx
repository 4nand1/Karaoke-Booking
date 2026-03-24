"use client"

import dynamic from "next/dynamic"

const MapPreview = dynamic(() => import("@/_components/client/MapPreview"), { ssr: false })

export default function MapClient() {
  return <MapPreview />
}