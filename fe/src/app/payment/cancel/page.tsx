"use client"

import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { XCircle } from "lucide-react"
import Navbar from "@/_components/client/navbar"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language"

export default function PaymentCancelPage() {
  const { t } = useLanguage()
  const { isSignedIn } = useAuth()

  return (
    <>
      <Navbar />
      <main id="main" className="wrap max-w-lg pt-28">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <XCircle className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-semibold">{t("Payment cancelled", "Төлбөр цуцлагдлаа")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t(
              "Your booking was saved as pending. You can pay later from My bookings or at the venue.",
              "Захиалга хүлээгдэж буй төлөвт хадгалагдлаа. Дараа нь Миний захиалгууд хэсгээс эсвэл газар дээр нь төлж болно."
            )}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            {isSignedIn && (
              <Button asChild>
                <Link href="/my-bookings">{t("My bookings", "Миний захиалгууд")}</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/">{t("Back to venues", "Буцах")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
