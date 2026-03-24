"use client";

import type { Order, KaraokeWithDistance } from "./types";
import {
  getBookingStatus,
  getIsOpenNow,
  getKaraokeImage,
} from "./utils";

type KaraokeMapPopupProps = {
  karaoke: KaraokeWithDistance;
  orders: Order[];
  onBookNow: () => void;
};

export default function KaraokeMapPopup({
  karaoke,
  orders,
  onBookNow,
}: KaraokeMapPopupProps) {
  const isOpenNow = getIsOpenNow(karaoke.openingTime, karaoke.closingTime);
  const imageSrc = getKaraokeImage(karaoke);
  const bookingStatus = getBookingStatus(karaoke, orders, isOpenNow);

  return (
    <div className="w-[min(14rem,calc(100vw-5rem))] space-y-3">
      <img
        src={imageSrc}
        alt={karaoke.name}
        className="h-28 w-full rounded-xl object-cover"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <p className="font-semibold">{karaoke.name}</p>
        <span
          className={[
            "w-fit rounded-full px-2 py-1 text-[11px] font-semibold",
            isOpenNow
              ? "bg-emerald-500/15 text-emerald-600"
              : "bg-slate-500/15 text-slate-500",
          ].join(" ")}
        >
          {isOpenNow ? "Open now" : "Closed"}
        </span>
      </div>
      <span
        className={[
          "inline-flex rounded-full px-2 py-1 text-[11px] font-semibold",
          bookingStatus.className,
        ].join(" ")}
      >
        {bookingStatus.label}
      </span>
      <p className="text-sm text-muted-foreground">
        {karaoke.address}, {karaoke.city}
      </p>
      <p className="text-sm text-muted-foreground">
        {karaoke.openingTime} - {karaoke.closingTime}
      </p>
      <p className="text-sm text-muted-foreground">{karaoke.phone}</p>
      <p className="text-xs text-muted-foreground">{bookingStatus.detail}</p>
      {typeof karaoke.distance === "number" && (
        <p className="text-sm font-medium text-primary">
          {karaoke.distance.toFixed(1)} km away
        </p>
      )}
      <button
        type="button"
        onClick={onBookNow}
        className="w-full cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Book now
      </button>
    </div>
  );
}
