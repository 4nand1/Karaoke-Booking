import type { Metadata } from "next"
import Navbar from "@/_components/client/navbar"
import MapPreview from "@/_components/client/MapPreviewClient"
import Footer from "@/_components/client/Footer"

export const metadata: Metadata = { title: "Map" }

export default function MapPage() {
  return (
    <>
      <Navbar />
      <MapPreview />
      <Footer />
    </>
  )
}
