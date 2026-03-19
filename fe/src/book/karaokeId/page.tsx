"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

export default function BookingPage() {
  const params = useParams()
  const karaokeId = params.karaokeId as string

  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleBooking() {
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          karaokeId,
          guestPhoneNumber: phone,
          guestConfirmationCode: code,
          roomId: "TEMP_ROOM_ID", // must come from real UI later
          BookingId: "TEMP_BOOKING_ID",
          totalAmount: 0,
          Location: "unknown",
        }),
      })

      if (!res.ok) throw new Error("Booking failed")

      alert("Booking successful")
    } catch {
      alert("Error creating booking")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Book Karaoke</h1>

      <input
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />

      <input
        placeholder="Confirmation code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />

      <button
        onClick={handleBooking}
        disabled={loading}
        className="w-full bg-black text-white p-3 rounded"
      >
        {loading ? "Booking..." : "Confirm Booking"}
      </button>
    </main>
  )
}