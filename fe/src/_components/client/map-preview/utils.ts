"use client";

import { getDistanceKm } from "@/lib/distance";
import type {
  BookingStatusView,
  Karaoke,
  KaraokeWithDistance,
  Order,
  UserLocation,
} from "./types";

const FALLBACK_IMAGE = "/karaoke-card-1.jpg";

export function toMinutes(value?: string) {
  if (!value || !value.includes(":")) return null;

  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

export function getIsOpenNow(openingTime?: string, closingTime?: string) {
  const open = toMinutes(openingTime);
  const close = toMinutes(closingTime);

  if (open === null || close === null) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (open <= close) {
    return currentMinutes >= open && currentMinutes <= close;
  }

  return currentMinutes >= open || currentMinutes <= close;
}

export function getKaraokeImage(karaoke: Karaoke) {
  return (
    karaoke.image ||
    karaoke.images?.[0] ||
    karaoke.rooms?.find((room) => room.image)?.image ||
    FALLBACK_IMAGE
  );
}

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentSlot() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");

  return `${hours}:00`;
}

export function getBookingStatus(
  karaoke: Karaoke,
  orders: Order[],
  isOpenNow: boolean
): BookingStatusView {
  if (!isOpenNow) {
    return {
      label: "Unavailable now",
      detail: "Booking status is shown for currently open venues.",
      className: "bg-slate-500/15 text-slate-500",
    };
  }

  const today = getTodayDateString();
  const currentSlot = getCurrentSlot();
  const activeOrders = orders.filter((order) => {
    return (
      String(order.karaokeId) === karaoke._id &&
      order.bookingDate === today &&
      order.status !== "cancelled" &&
      Array.isArray(order.bookingSlots) &&
      order.bookingSlots.includes(currentSlot)
    );
  });

  const bookedRooms = new Set(
    activeOrders.map((order) => order.roomId).filter(Boolean)
  ).size;
  const totalRooms = karaoke.rooms?.length ?? 0;

  if (bookedRooms === 0) {
    return {
      label: "Available now",
      detail: `No bookings found for ${currentSlot}.`,
      className: "bg-sky-500/15 text-sky-600",
    };
  }

  if (totalRooms > 0 && bookedRooms >= totalRooms) {
    return {
      label: "Fully booked now",
      detail: `All ${totalRooms} rooms are booked for ${currentSlot}.`,
      className: "bg-rose-500/15 text-rose-600",
    };
  }

  if (totalRooms > 0) {
    return {
      label: `${Math.max(totalRooms - bookedRooms, 0)} room left`,
      detail: `${bookedRooms}/${totalRooms} rooms are booked for ${currentSlot}.`,
      className: "bg-amber-500/15 text-amber-600",
    };
  }

  return {
    label: "Booked now",
    detail: `${bookedRooms} booking found for ${currentSlot}.`,
    className: "bg-amber-500/15 text-amber-600",
  };
}

export function isFreeNow(karaoke: Karaoke, orders: Order[]): boolean {
  const isOpenNow = getIsOpenNow(karaoke.openingTime, karaoke.closingTime);
  if (!isOpenNow) return false;

  const today = getTodayDateString();
  const currentSlot = getCurrentSlot();

  const bookedRooms = new Set(
    orders
      .filter(
        (order) =>
          String(order.karaokeId) === karaoke._id &&
          order.bookingDate === today &&
          order.status !== "cancelled" &&
          Array.isArray(order.bookingSlots) &&
          order.bookingSlots.includes(currentSlot)
      )
      .map((order) => order.roomId)
      .filter(Boolean)
  ).size;

  return bookedRooms === 0;
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
