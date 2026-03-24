import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentSuccessPage() {
  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-2xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="mt-5 text-3xl font-bold text-foreground">
          Payment successful
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your Stripe test payment was completed successfully.
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
