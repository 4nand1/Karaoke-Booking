"use client"

import dynamic from "next/dynamic"

const MapPreview = dynamic(() => import("./MapPreview"), {
  ssr: false,
  loading: () => (
    <section className="container mx-auto px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
        Loading map...
      </div>
    </section>
  ),
})

export default MapPreview
