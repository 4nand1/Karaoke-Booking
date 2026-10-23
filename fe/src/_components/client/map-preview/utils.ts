"use client";

import { getDistanceKm } from "@/lib/distance";
import { formatMinutes, isOpenAt, nightNow } from "@/lib/venue";
import type {
  Karaoke,
  KaraokeWithDistance,
  Order,
  UserLocation,
} from "./types";

const FALLBACK_IMAGE = "/karaoke-card-1.jpg";

export function getKaraokeImage(karaoke: Karaoke) {
  return (
    karaoke.image ||
    karaoke.images?.[0] ||
    karaoke.rooms?.find((room) => room.image)?.image ||
    FALLBACK_IMAGE
  );
}

export type NowState = { state: "closed" | "free" | "busy" | "full"; left: number };

// How many rooms are free this hour, using the venue's "night" date (see nightNow).
export function getNowState(karaoke: Karaoke, orders: Order[]): NowState {
  const rooms = karaoke.rooms?.length ?? 0;
  if (!isOpenAt(karaoke.openingTime, karaoke.closingTime)) return { state: "closed", left: rooms };

  const night = nightNow(karaoke.openingTime, karaoke.closingTime);
  const slot = formatMinutes(Math.floor(night.minutes / 60) * 60);
  const booked = new Set(
    orders
      .filter(
        (order) =>
          String(order.karaokeId) === karaoke._id &&
          order.bookingDate === night.date &&
          order.status !== "cancelled" &&
          order.bookingSlots?.includes(slot)
      )
      .map((order) => order.roomId)
  ).size;

  if (booked === 0) return { state: "free", left: rooms };
  if (rooms > 0 && booked >= rooms) return { state: "full", left: 0 };
  return { state: "busy", left: Math.max(rooms - booked, 0) };
}

export function getNearbyKaraokes(
  karaokes: Karaoke[],
  userLocation: UserLocation | null
): KaraokeWithDistance[] {
  const valid = karaokes.filter(
    (karaoke): karaoke is KaraokeWithDistance =>
      typeof karaoke.latitude === "number" &&
      typeof karaoke.longitude === "number"
  );

  if (!userLocation) return valid;

  return valid
    .map((karaoke) => ({
      ...karaoke,
      distance: getDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        karaoke.latitude!,
        karaoke.longitude!
      ),
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
}

export function getFitPoints(
  nearbyKaraokes: KaraokeWithDistance[],
  userLocation: UserLocation | null
): [number, number][] {
  const points: [number, number][] = [];

  if (userLocation) {
    points.push([userLocation.latitude, userLocation.longitude]);
  }

  nearbyKaraokes.forEach((karaoke) => {
    if (
      typeof karaoke.latitude === "number" &&
      typeof karaoke.longitude === "number"
    ) {
      points.push([karaoke.latitude, karaoke.longitude]);
    }
  });

  return points;
}
