"use client"

import Link from "next/link"
import { Mic } from "lucide-react"
import { useLanguage } from "@/lib/language"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border py-10">
      <div className="wrap flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm space-y-3">
          <Link href="/" className="flex items-center gap-2" aria-label="KaraokeNow">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Mic className="size-4" />
            </span>
            <span className="font-display font-semibold">
              Karaoke<span className="text-primary">Now</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            {t(
              "Find, compare, and book karaoke rooms in your city. Your perfect night out starts here.",
              "Хотынхоо караоке өрөөг хайж, харьцуулж, захиалаарай. Төгс үдэш эндээс эхэлнэ."
            )}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Footer">
          <Link href="/map" className="hover:text-foreground">{t("Map", "Газрын зураг")}</Link>
          <Link href="/sign-up?role=admin" className="hover:text-foreground">{t("List your venue", "Караокегоо бүртгүүлэх")}</Link>
          <Link href="/my-bookings" className="hover:text-foreground">{t("My bookings", "Миний захиалгууд")}</Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          {t("© 2026 KaraokeNow. All rights reserved.", "© 2026 KaraokeNow. Бүх эрх хуулиар хамгаалагдсан.")}
        </p>
      </div>
    </footer>
  )
}
