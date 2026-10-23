"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const MapPreview = dynamic(() => import("./MapPreview"), {
  ssr: false,
  loading: () => (
    <div className="wrap pt-24">
      <Skeleton className="h-[55svh] rounded-2xl" />
    </div>
  ),
})

export default MapPreview
