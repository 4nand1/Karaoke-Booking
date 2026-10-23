"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language"
import { cn } from "@/lib/utils"

export type FilterValues = {
  openNow: boolean
  roomType: "all" | "Small" | "Medium" | "VIP"
  price: "all" | "lt50" | "50to80" | "gt80"
}

export const defaultFilters: FilterValues = { openNow: false, roomType: "all", price: "all" }

const chip =
  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors"
const on = "border-primary bg-primary/15 text-primary"
const off = "border-border bg-card text-foreground hover:border-foreground/30"

export default function FilterBar({
  value,
  onChange,
}: {
  value: FilterValues
  onChange: (next: FilterValues) => void
}) {
  const { t } = useLanguage()

  const rooms = [
    { key: "Small", label: t("Small", "Жижиг") },
    { key: "Medium", label: t("Medium", "Дунд") },
    { key: "VIP", label: "VIP" },
  ] as const
  const prices = [
    { key: "lt50", label: t("Under ₮50k", "₮50k хүртэл") },
    { key: "50to80", label: "₮50k–80k" },
    { key: "gt80", label: "₮80k+" },
  ] as const
  const active = value.openNow || value.roomType !== "all" || value.price !== "all"

  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <button
          type="button"
          aria-pressed={value.openNow}
          onClick={() => onChange({ ...value, openNow: !value.openNow })}
          className={cn(chip, value.openNow ? on : off)}
        >
          <span className="size-2 rounded-full bg-live" />
          {t("Open now", "Одоо нээлттэй")}
        </button>
        {rooms.map((room) => (
          <button
            key={room.key}
            type="button"
            aria-pressed={value.roomType === room.key}
            onClick={() => onChange({ ...value, roomType: value.roomType === room.key ? "all" : room.key })}
            className={cn(chip, value.roomType === room.key ? on : off)}
          >
            {room.label}
          </button>
        ))}
        {prices.map((price) => (
          <button
            key={price.key}
            type="button"
            aria-pressed={value.price === price.key}
            onClick={() => onChange({ ...value, price: value.price === price.key ? "all" : price.key })}
            className={cn(chip, value.price === price.key ? on : off)}
          >
            {price.label}
          </button>
        ))}
        {active && (
          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => onChange(defaultFilters)}>
            {t("Clear", "Арилгах")}
          </Button>
        )}
      </div>
    </div>
  )
}
