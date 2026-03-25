"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/axios"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Verifying your payment...")
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const sessionId = new URLSearchParams(window.location.search).get("session_id")

    if (!sessionId) {
      setError("Stripe session id was not found.")
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await api.get(`/payments/checkout-session/${sessionId}`)

        if (!response.data?.paid) {
          throw new Error("Payment is not marked as completed yet.")
        }

        setMessage("Payment successful. Redirecting to My Bookings...")

        window.setTimeout(() => {
          router.replace("/my-bookings?payment=success")
        }, 1200)
      } catch (verifyError) {
        const nextMessage =
          verifyError instanceof Error
            ? verifyError.message
            : "Failed to verify Stripe payment."

        setError(nextMessage)
      }
    }

    void verifyPayment()
  }, [router])

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-2xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="mt-5 text-3xl font-bold text-foreground">
          Payment successful
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {error || message}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-xl">
            <Link href="/my-bookings">Go to My Bookings</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
