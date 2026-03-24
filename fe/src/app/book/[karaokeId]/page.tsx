"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  Star,
  Users,
  Utensils,
} from "lucide-react";
import { api } from "@/lib/axios";
import { apiRootUrl } from "@/lib/api-url";
import { Button } from "@/components/ui/button";
import ReviewForm from "@/_components/client/ReviewForm";

type Room = {
  _id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  image: string;
};

type MenuItem = {
  _id?: string;
  name?: string;
  price?: number;
  description?: string;
};

type Karaoke = {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  openingTime: string;
  closingTime: string;
  image?: string | null;
  rooms?: Room[];
  menu?: MenuItem[];
};

const parseTimeToMinutes = (value: string) => {
  const match = value.match(/(\d{1,2})(?::(\d{2}))?/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2] || "0");

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const formatMinutesToTime = (minutes: number) => {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const mins = (normalized % 60).toString().padStart(2, "0");

  return `${hours}:${mins}`;
};

export default function BookingPage() {
  const params = useParams<{ karaokeId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const karaokeId = params.karaokeId;

  const [karaoke, setKaraoke] = useState<Karaoke | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    bookingDate: "",
    guestCount: "2",
  });
  const [feedback, setFeedback] = useState<{
    type: "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchKaraoke = async () => {
      if (karaokeId === "sample") {
        const fallbackName = searchParams.get("name") || "Sample Karaoke";
        const fallbackLocation =
          searchParams.get("location") || "Location unavailable";
        const [address, city] = fallbackLocation
          .split(",")
          .map((item) => item.trim());

        setKaraoke({
          _id: "sample",
          name: fallbackName,
          address: address || fallbackLocation,
          city: city || "City unavailable",
          phone: "Not available yet",
          description:
            "This venue page is ready for booking details. Real room and menu data can be connected later.",
          openingTime:
            searchParams.get("hours")?.split("–")[0]?.trim() || "18:00",
          closingTime:
            searchParams.get("hours")?.split("–")[1]?.trim() || "02:00",
          image: searchParams.get("image") || "/karaoke.jpg",
          rooms: [],
          menu: [],
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${apiRootUrl}/karaoke/${karaokeId}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch karaoke");
        }

        const data = (await response.json()) as { karaoke?: Karaoke };
        const karaokeData = data.karaoke ?? null;

        setKaraoke(karaokeData);
        setSelectedRoomId(karaokeData?.rooms?.[0]?._id ?? "");
        setSelectedSlots([]);
        setFeedback(null);
      } catch (error) {
        console.error("Failed to load booking page:", error);
        setFeedback({
          type: "error",
          message: "Failed to load karaoke details.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (karaokeId) {
      fetchKaraoke();
    }
  }, [karaokeId, searchParams]);

  const selectedRoom = useMemo(
    () => karaoke?.rooms?.find((room) => room._id === selectedRoomId) ?? null,
    [karaoke?.rooms, selectedRoomId],
  );

  const ratingLabel = searchParams.get("rating") || "4.8";
  const fallbackPriceLabel = searchParams.get("price") || "Price unavailable";

  const timeSlots = useMemo(() => {
    const openMinutes = parseTimeToMinutes(karaoke?.openingTime || "");
    const closeMinutes = parseTimeToMinutes(karaoke?.closingTime || "");

    if (openMinutes == null || closeMinutes == null) {
      return [];
    }

    const normalizedCloseMinutes =
      closeMinutes <= openMinutes ? closeMinutes + 24 * 60 : closeMinutes;
    const slots: string[] = [];

    for (let current = openMinutes; current < normalizedCloseMinutes; current += 60) {
      slots.push(formatMinutesToTime(current));
    }

    return slots;
  }, [karaoke?.closingTime, karaoke?.openingTime]);

  const estimatedTotal = selectedRoom ? selectedRoom.price * selectedSlots.length : 0;

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((item) => item !== slot) : [...prev, slot],
    );
  };

  const handleSubmit = async () => {
    if (!karaoke || !selectedRoom || karaoke._id === "sample") {
      setFeedback({
        type: "error",
        message: "Room information is missing.",
      });
      return;
    }

    if (
      !formData.customerName.trim() ||
      !formData.customerPhone.trim() ||
      !formData.bookingDate ||
      !selectedSlots.length
    ) {
      setFeedback({
        type: "error",
        message: "Please fill in all booking details.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const response = await api.post("/booking", {
        karaokeId: karaoke._id,
        roomId: selectedRoom._id,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        bookingDate: formData.bookingDate,
        bookingSlots: selectedSlots,
        guestCount: Number(formData.guestCount) || 1,
      });

      if (!response.data?.success) {
        throw new Error("Failed to create booking");
      }

      router.push("/my-bookings");
    } catch (error) {
      console.error("Booking failed:", error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to create booking"
        : "Failed to create booking";

      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-6 py-16">
        Loading booking details...
      </main>
    );
  }

  if (!karaoke) {
    return (
      <main className="container mx-auto px-6 py-16">Karaoke not found.</main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative h-72">
            <img
              src={karaoke.image || "/karaoke.jpg"}
              alt={karaoke.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl font-bold text-white">{karaoke.name}</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/90">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {karaoke.address}, {karaoke.city}
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {karaoke.openingTime} - {karaoke.closingTime}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {karaoke.phone}
                </span>
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {ratingLabel} / 5.0
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <h2 className="text-lg font-semibold">About This Venue</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {karaoke.description}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Choose a Room</h2>
              {(karaoke.rooms ?? []).length ? (
                <div className="mt-4 grid gap-3">
                  {(karaoke.rooms ?? []).map((room) => {
                    const selected = room._id === selectedRoomId;

                    return (
                      <button
                        key={room._id}
                        type="button"
                        onClick={() => {
                          setSelectedRoomId(room._id);
                          setSelectedSlots([]);
                        }}
                        className={[
                          "rounded-2xl border p-4 text-left transition-all",
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:border-primary/40",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">{room.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {room.type} room
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              Up to {room.capacity} guests
                            </p>
                          </div>
                          <p className="text-lg font-bold text-primary">
                            ₮{room.price.toLocaleString()}/hr
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-5">
                  <p className="font-medium">Room information is coming soon</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Odoogoor ene karaoke deer room-uudiin medeelel oruulaagui
                    baina. Booking page ni belen, daraa ni live room data holboj
                    bolno.
                  </p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold">Menu</h2>
              {(karaoke.menu ?? []).length ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {(karaoke.menu ?? []).map((item, index) => (
                    <div
                      key={item._id || `${item.name}-${index}`}
                      className="rounded-2xl border border-border bg-background p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.name || "Menu item"}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description || "Description not available"}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-primary">
                          {typeof item.price === "number"
                            ? `₮${item.price.toLocaleString()}`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-5">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-primary" />
                    <p className="font-medium">Menu will appear here</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Odoogoor menu medeellel baihgui baina. Karaoke owner menu
                    oruulsnii daraa ene hesegt khool, undaa, une haragddana.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Complete Your Booking</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Songoson medeellee shalgaad zahialgaa ilgeene uu.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Your name</span>
              <input
                value={formData.customerName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
                placeholder="Enter your name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Phone number</span>
              <input
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerPhone: e.target.value,
                  }))
                }
                placeholder="Phone number"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4" />
                Date
              </span>
              <input
                type="date"
                value={formData.bookingDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bookingDate: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </label>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Clock3 className="h-4 w-4" />
                Select one or more hours
              </div>
              {timeSlots.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {timeSlots.map((slot) => {
                    const active = selectedSlots.includes(slot);

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        className={[
                          "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:border-primary/50",
                        ].join(" ")}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  Time slots are not available yet for this venue.
                </div>
              )}
            </div>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Guests
              </span>
              <input
                type="number"
                min="1"
                value={formData.guestCount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    guestCount: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl bg-muted/40 p-4">
            <p className="text-sm font-medium">Selected room</p>
            <p className="mt-1 text-lg font-semibold">
              {selectedRoom?.name || "No room selected"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedRoom
                ? `${selectedRoom.type} · Up to ${selectedRoom.capacity} guests`
                : "Room data odoogoor baihgui baina"}
            </p>
            {selectedSlots.length ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Selected hours: {selectedSlots.join(", ")}
              </p>
            ) : null}
            {selectedRoom ? (
              <>
                <p className="mt-3 text-lg font-bold text-primary">
                  ₮{estimatedTotal.toLocaleString()} total
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ₮{selectedRoom.price.toLocaleString()}/hr x{" "}
                  {selectedSlots.length || 1} hour
                </p>
              </>
            ) : (
              <p className="mt-3 text-lg font-bold text-primary">
                {fallbackPriceLabel}
              </p>
            )}
          </div>

          {feedback && (
            <div
              className={[
                "mt-6 rounded-2xl border px-4 py-3 text-sm",
                feedback.type === "error"
                  ? "border-red-500/20 bg-red-500/10 text-red-400"
                  : "border-blue-500/20 bg-blue-500/10 text-blue-400",
              ].join(" ")}
            >
              {feedback.message}
            </div>
          )}

          <Button
            variant="neon"
            className="mt-6 w-full rounded-xl"
            disabled={!selectedRoom || submitting}
            onClick={() => {
              if (karaoke._id === "sample") {
                setFeedback({
                  type: "info",
                  message: "This sample card is not linked to a live karaoke yet.",
                });
                return;
              }

              handleSubmit();
            }}
          >
            {karaoke._id === "sample"
              ? "Link to live karaoke required"
              : submitting
                ? "Booking..."
                : "Confirm Booking"}
          </Button>
        </section>
      </div>

      <ReviewForm karaokeId={karaokeId} />
    </main>
  );
}
