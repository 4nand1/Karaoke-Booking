"use client";

import { Clock3, MapPin, Navigation } from "lucide-react";
import type { Order, KaraokeWithDistance } from "./types";
import {
  getBookingStatus,
  getIsOpenNow,
  getKaraokeImage,
} from "./utils";

type NearbyKaraokeCardProps = {
  karaoke: KaraokeWithDistance;
  orders: Order[];
  isSelected: boolean;
  onSelect: () => void;
  onBookNow: () => void;
};

export default function NearbyKaraokeCard({
  karaoke,
  orders,
  isSelected,
  onSelect,
  onBookNow,
}: NearbyKaraokeCardProps) {
  const isOpenNow = getIsOpenNow(karaoke.openingTime, karaoke.closingTime);
  const imageSrc = getKaraokeImage(karaoke);
  const bookingStatus = getBookingStatus(karaoke, orders, isOpenNow);

  return (
    <div
      className={[
        "w-full rounded-2xl border bg-card p-4 text-left shadow-sm transition-all duration-200",
        isSelected
          ? "border-primary ring-1 ring-primary/30"
          : "border-border hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full cursor-pointer text-left"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <img
            src={imageSrc}
            alt={karaoke.name}
            className="h-36 w-full rounded-xl object-cover sm:h-20 sm:w-20 sm:shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <h3 className="font-semibold text-card-foreground">
                {karaoke.name}
              </h3>
              <span
                className={[
                  "w-fit shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                  isOpenNow
                    ? "bg-emerald-500/15 text-emerald-600"
                    : "bg-slate-500/15 text-slate-500",
                ].join(" ")}
              >
                {isOpenNow ? "Open now" : "Closed"}
              </span>
            </div>

            <div className="mt-2">
              <span
                className={[
                  "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                  bookingStatus.className,
                ].join(" ")}
              >
                {bookingStatus.label}
              </span>
            </div>

            <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                {karaoke.address}, {karaoke.city}
              </p>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              <span>
                {karaoke.openingTime} - {karaoke.closingTime}
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {bookingStatus.detail}
            </p>

            {typeof karaoke.distance === "number" && (
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-primary">
                <Navigation className="h-4 w-4" />
                <span>{karaoke.distance.toFixed(1)} km away</span>
              </div>
            )}
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={onBookNow}
        className="mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
      >
        Book now
      </button>
    </div>
  );
}
