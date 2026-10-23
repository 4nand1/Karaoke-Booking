"use client"

import Link from "next/link"
import { Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDisplayLocation } from "@/lib/location"
import { useLanguage } from "@/lib/language"
import { cn } from "@/lib/utils"
import type { KaraokeWithDistance, Order } from "./types"
import { getKaraokeImage, getNowState } from "./utils"

type Props = {
  karaoke: KaraokeWithDistance
  orders: Order[]
  isSelected: boolean
  onSelect: () => void
}

export default function NearbyKaraokeCard({ karaoke, orders, isSelected, onSelect }: Props) {
  const { t } = useLanguage()
  const { state, left } = getNowState(karaoke, orders)

  const status = {
    free: { text: t("Free now", "Одоо сул"), className: "text-live" },
    busy: { text: t(`${left} rooms free`, `${left} өрөө сул`), className: "text-warning" },
    full: { text: t("Fully booked", "Дүүрсэн"), className: "text-destructive" },
    closed: { text: t("Closed", "Хаалттай"), className: "text-muted-foreground" },
  }[state]

  return (
    <div
      id={`venue-${karaoke._id}`}
      className={cn(
        "flex gap-3 rounded-2xl border bg-card p-3 transition-colors",
        isSelected ? "border-primary ring-2 ring-primary/30" : "border-border"
      )}
    >
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 gap-3 text-left" aria-pressed={isSelected}>
        <img src={getKaraokeImage(karaoke)} alt="" className="size-20 shrink-0 rounded-xl object-cover" loading="lazy" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{karaoke.name}</span>
          <span className={cn("block text-sm font-semibold", status.className)}>{status.text}</span>
          <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            {formatDisplayLocation(karaoke.address, karaoke.city)}
          </span>
          <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
            <Clock className="size-3 shrink-0" />
            {karaoke.openingTime}–{karaoke.closingTime}
            {typeof karaoke.distance === "number" && ` · ${karaoke.distance.toFixed(1)} km`}
          </span>
        </span>
      </button>
      <Button size="sm" asChild className="self-center">
        <Link href={`/book/${karaoke._id}`}>{t("Book", "Захиалах")}</Link>
      </Button>
    </div>
  )
}
