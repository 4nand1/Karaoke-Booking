"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language"

export default function Hero({ total = 0, openNow = 0 }: { total?: number; openNow?: number }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [query, setQuery] = useState("")

  return (
    <section className="relative isolate flex h-[78svh] max-h-[760px] min-h-[560px] items-end">
      <Image src="/hero-1.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <div className="wrap pb-10 md:pb-16">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-live">
          <span className="eq" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          {t("Ulaanbaatar · tonight", "Улаанбаатар · өнөө орой")}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.02em] md:text-[4rem]">
          {t("Pick a room. Grab the mic.", "Өрөөгөө сонго. Микрофоноо ав.")}
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          {t(
            "Compare karaoke rooms across the city and book in under a minute.",
            "Хотын караоке өрөөнүүдийг харьцуулж, нэг минутад захиалаарай."
          )}
        </p>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            const q = query.trim()
            router.push(q ? `/?q=${encodeURIComponent(q)}#venues` : "/#venues")
          }}
          className="mt-6 flex h-14 max-w-xl items-center gap-2 rounded-full border border-border bg-card/90 pl-5 pr-1.5 shadow-card backdrop-blur"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Venue or area…", "Караоке эсвэл байршил…")}
            aria-label={t("Search venues", "Караоке хайх")}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" className="shadow-glow">
            <Search /> {t("Search", "Хайх")}
          </Button>
        </form>
        {total > 0 && (
          <p className="mt-4 text-sm tabular-nums text-muted-foreground">
            {t(`${total} venues · ${openNow} open now`, `${total} караоке · ${openNow} одоо нээлттэй`)}
          </p>
        )}
      </div>
    </section>
  )
}
