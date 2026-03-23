import Navbar from "@/_components/client/navbar"
import MapPreview from "@/_components/client/MapPreview"
import Footer from "@/_components/client/Footer"

export default function MapPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <MapPreview />
      </main>
      <Footer />
    </div>
  )
}
