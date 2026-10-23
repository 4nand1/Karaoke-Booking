"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import Navbar from "@/_components/client/navbar"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/axios"
import { useLanguage } from "@/lib/language"

function SuccessContent() {
  const { t } = useLanguage()
  const { isSignedIn } = useAuth()
  const sessionId = useSearchParams().get("session_id")
  const [state, setState] = useState<"verifying" | "paid" | "failed">(sessionId ? "verifying" : "failed")

  useEffect(() => {
    if (!sessionId) return
    api
      .get(`/payments/checkout-session/${sessionId}`)
      .then((res) => setState(res.data?.paid ? "paid" : "failed"))
      .catch(() => setState("failed"))
  }, [sessionId])

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
      {state === "verifying" && (
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <span className="eq text-primary" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          {t("Confirming payment…", "Төлбөрийг шалгаж байна…")}
        </div>
      )}
      {state === "paid" && (
        <>
          <CheckCircle2 className="mx-auto size-12 text-live" />
          <h1 className="mt-4 font-display text-2xl font-semibold">{t("You're booked!", "Захиалга баталгаажлаа!")}</h1>
          <p className="mt-2 text-muted-foreground">{t("Payment received. See you on stage.", "Төлбөр амжилттай. Тайзан дээр уулзъя!")}</p>
        </>
      )}
      {state === "failed" && (
        <>
          <AlertCircle className="mx-auto size-12 text-warning" />
          <h1 className="mt-4 font-display text-2xl font-semibold">
            {t("We couldn't confirm the payment yet", "Төлбөрийг баталгаажуулж чадсангүй")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t(
              "If you were charged, your booking updates automatically in a few minutes.",
              "Төлбөр гарсан бол захиалга хэдэн минутын дотор автоматаар шинэчлэгдэнэ."
            )}
          </p>
        </>
      )}
      {state !== "verifying" && (
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
      )}
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="wrap max-w-lg pt-28">
        <Suspense>
          <SuccessContent />
        </Suspense>
      </main>
    </>
  )
}
