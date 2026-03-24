"use client";

export type Room = {
  _id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  image: string;
};

export type Karaoke = {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  openingTime: string;
  closingTime: string;
  latitude?: number | null;
  longitude?: number | null;
  ownerClerkUserId?: string;
  image?: string | null;
  images?: string[];
  rooms?: Room[];
};

export type KaraokeWithDistance = Karaoke & {
  distance?: number;
};

export type UserLocation = {
  latitude: number;
  longitude: number;
};

export type Order = {
  _id: string;
  karaokeId?: string;
  roomId?: string;
  bookingDate?: string;
  bookingSlots?: string[];
  status?: "pending" | "confirmed" | "cancelled";
};

export type BookingStatusView = {
  label: string;
  detail: string;
  className: string;
};
