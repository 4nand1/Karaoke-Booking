"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, MapPin, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatMNT } from "@/lib/venue"
import { useLanguage } from "@/lib/language"

type Props = {
  id: string
  image: string
  name: string
  location: string
  rating: number | null
  price: number | null
  openingTime?: string
  closingTime?: string
  isOpen: boolean
  roomTypes: string[]
  index: number
}

const ROOM_LABELS: Record<string, [string, string]> = {
  Small: ["Small", "Жижиг"],
  Medium: ["Medium", "Дунд"],
  VIP: ["VIP", "VIP"],
}

export default function KaraokeCard({
  id, image, name, location, rating, price, openingTime, closingTime, isOpen, roomTypes, index,
}: Props) {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/book/${id}`}
        className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            {isOpen ? (
              <>
                <span className="size-2 rounded-full bg-live" />
                {t("Open now", "Нээлттэй")}
              </>
            ) : (
              <span className="text-muted-foreground">
                {t(`Opens ${openingTime ?? ""}`, `${openingTime ?? ""}-д нээнэ`)}
              </span>
            )}
          </span>
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            {rating !== null ? (
              <>
                <Star className="size-3 fill-primary text-primary" />
                {rating}
              </>
            ) : (
              t("New", "Шинэ")
            )}
          </span>
        </div>
        <div className="p-4">
          <h3 className="truncate text-lg font-semibold">{name}</h3>
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {location}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            {openingTime}–{closingTime}
          </p>
          <div className="mt-4 flex items-end justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {price !== null ? (
                <>
                  {t("from ", "")}
                  <b className="font-display text-lg text-foreground">{formatMNT(price)}</b>
                  {t(" / hr", "-с / цаг")}
                </>
              ) : (
                t("Ask for price", "Үнэ лавлах")
              )}
            </p>
            <div className="flex flex-wrap justify-end gap-1">
              {roomTypes.map((type) => (
                <Badge key={type} variant="outline">
                  {t(...(ROOM_LABELS[type] ?? [type, type]))}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
