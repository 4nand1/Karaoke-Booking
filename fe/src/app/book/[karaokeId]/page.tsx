import { cache } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Navbar from "@/_components/client/navbar"
import Footer from "@/_components/client/Footer"
import { apiBaseUrl } from "@/lib/api-url"
import BookingClient, { type Karaoke } from "./BookingClient"

const getKaraoke = cache(async (id: string): Promise<Karaoke | null> => {
  try {
    const res = await fetch(`${apiBaseUrl}/karaoke/${id}`, { cache: "no-store" })
    return res.ok ? ((await res.json()).karaoke as Karaoke) : null
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: { params: Promise<{ karaokeId: string }> }): Promise<Metadata> {
  const k = await getKaraoke((await params).karaokeId)
  if (!k) return {}
  return {
    title: k.name,
    description: k.description.slice(0, 150),
    openGraph: k.image?.startsWith("/") ? { images: [k.image] } : undefined,
  }
}

export default async function BookingPage({ params }: { params: Promise<{ karaokeId: string }> }) {
  const karaoke = await getKaraoke((await params).karaokeId)
  if (!karaoke) notFound()

  return (
    <>
      <Navbar />
      <BookingClient karaoke={karaoke} />
      <Footer />
    </>
  )
}
