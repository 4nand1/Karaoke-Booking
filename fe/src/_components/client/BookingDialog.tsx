"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Star,
  Clock,
  Navigation,
  Users,
  Music,
  Utensils,
  Check,
  Phone,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/axios";

interface RoomOption {
  _id?: string;
  name: string;
  capacity: string;
  price: string;
  features: string[];
  amount?: number;
  type?: string;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  hours: string;
  karaokeId?: string;
  rooms?: RoomOption[];
}

const defaultRoomOptions: RoomOption[] = [
  {
    name: "Standard Room",
    capacity: "2–4 guests",
    price: "$18/hr",
    features: ["Basic sound system", "2 microphones", "Song catalog"],
  },
  {
    name: "Deluxe Room",
    capacity: "4–8 guests",
    price: "$35/hr",
    features: ["Premium speakers", "4 microphones", "Disco lights", "Song catalog"],
  },
  {
    name: "VIP Suite",
    capacity: "8–15 guests",
    price: "$60/hr",
    features: [
      "Surround sound",
      "6 microphones",
      "Stage lighting",
      "Mini bar",
      "Priority service",
    ],
  },
];

const BookingDialog = ({
  open,
  onOpenChange,
  image,
  name,
  location,
  rating,
  price,
  hours,
  karaokeId,
  rooms,
}: BookingDialogProps) => {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const openHour = hours.split("–")[0]?.trim() ?? "";
  const closeHour = hours.split("–")[1]?.trim() ?? "";
  const distance = (Math.random() * 4 + 0.5).toFixed(1);
  const roomOptions = rooms?.length ? rooms : defaultRoomOptions;
  const selectedRoomOption =
    selectedRoom !== null ? roomOptions[selectedRoom] ?? null : null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  };

  const resetForm = () => {
    setSelectedRoom(null);
    setCustomerName("");
    setCustomerPhone("");
    setBookingDate("");
    setBookingTime("");
    setGuestCount("2");
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoomOption || !karaokeId) {
      alert("This venue is not connected to live booking yet.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !bookingDate || !bookingTime) {
      alert("Please fill in your booking details.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/bookings", {
        karaokeId,
        roomId: selectedRoomOption._id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        bookingDate,
        bookingTime,
        guestCount: Number(guestCount) || 1,
      });

      if (!response.data?.success) {
        throw new Error("Booking failed");
      }

      alert("Booking sent successfully. The karaoke owner can now see it.");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Booking submit failed:", error);
      alert("Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-2xl border-border/50 bg-card p-0 sm:rounded-2xl">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-card via-card/40 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <DialogHeader className="space-y-0 text-left">
              <DialogTitle className="font-display text-2xl font-bold text-card-foreground drop-shadow-lg">
                {name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Booking details for {name}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="space-y-5 px-5 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: "Location", value: location },
              { icon: Navigation, label: "Distance", value: `${distance} km away` },
              { icon: Clock, label: "Opens", value: openHour },
              { icon: Clock, label: "Closes", value: closeHour },
              { icon: Star, label: "Rating", value: `${rating} / 5.0` },
              { icon: Music, label: "Starting at", value: price },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="truncate text-sm font-semibold text-card-foreground">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-3 font-display text-base font-semibold text-card-foreground">
              Choose a Room
            </h3>

            <div className="space-y-2.5">
              <AnimatePresence>
                {roomOptions.map((room, i) => (
                  <motion.button
                    key={room.name}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelectedRoom(i)}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 ${
                      selectedRoom === i
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                        : "border-border/50 bg-muted/30 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {room.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {room.capacity}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-bold text-primary">
                          {room.price}
                        </span>
                        {selectedRoom === i && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                          >
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {selectedRoom === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-2 flex flex-wrap gap-1.5"
                      >
                        {room.features.map((feature) => (
                          <span
                            key={feature}
                            className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                          >
                            {feature}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display text-base font-semibold text-card-foreground">
              Booking Details
            </h3>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="rounded-xl bg-muted/40 px-3 py-3">
                <span className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Your name
                </span>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-transparent text-sm font-medium text-card-foreground outline-none"
                />
              </label>

              <label className="rounded-xl bg-muted/40 px-3 py-3">
                <span className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </span>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full bg-transparent text-sm font-medium text-card-foreground outline-none"
                />
              </label>

              <label className="rounded-xl bg-muted/40 px-3 py-3">
                <span className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Date
                </span>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-card-foreground outline-none"
                />
              </label>

              <label className="rounded-xl bg-muted/40 px-3 py-3">
                <span className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Time
                </span>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-card-foreground outline-none"
                />
              </label>

              <label className="rounded-xl bg-muted/40 px-3 py-3 md:col-span-2">
                <span className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Guests
                </span>
                <input
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-card-foreground outline-none"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="neon"
              className="flex-1 rounded-xl"
              onClick={() => {
                onOpenChange(false);
                router.push(`/menu/${encodeURIComponent(name)}`);
              }}
            >
              <Utensils className="mr-1.5 h-4 w-4" />
              View Menu
            </Button>

            <Button
              variant="neon"
              className="flex-1 rounded-xl"
              disabled={selectedRoom === null || submitting}
              onClick={handleConfirmBooking}
            >
              {selectedRoom !== null
                ? submitting
                  ? "Booking..."
                  : "Confirm Booking"
                : "Select a Room"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
