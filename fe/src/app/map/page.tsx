import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Navbar from "@/_components/client/navbar"
import MapPreview from "@/_components/client/MapPreview"
import Footer from "@/_components/client/Footer"
import { Button } from "@/components/ui/button"

export default function MapPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <div className="container mx-auto px-4 pt-4">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <MapPreview />
      </main>
      <Footer />
    </div>
  )
}
