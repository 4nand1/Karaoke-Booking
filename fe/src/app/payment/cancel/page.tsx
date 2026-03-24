import Link from "next/link"
import { CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentCancelPage() {
  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-2xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <CircleX className="mx-auto h-14 w-14 text-red-500" />
        <h1 className="mt-5 text-3xl font-bold text-foreground">
          Payment canceled
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your Stripe Checkout payment was canceled. You can go back and try again.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-xl">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/my-bookings">View My Bookings</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
