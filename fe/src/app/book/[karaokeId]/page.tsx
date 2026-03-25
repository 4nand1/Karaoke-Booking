"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  Star,
  Users,
  Utensils,
  Plus,
  Minus,
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
  category?: "food" | "drink" | "set";
  image?: string;
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

type SelectedMenuItem = {
  item: MenuItem;
  quantity: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  food: "🍔 Хоол",
  drink: "🥤 Ундаа",
  set: "🎁 Сет",
};

const parseTimeToMinutes = (value: string) => {
  const match = value.match(/(\d{1,2})(?::(\d{2}))?/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] || "0");
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const formatMinutesToTime = (minutes: number) => {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60).toString().padStart(2, "0");
  const mins = (normalized % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

export default function BookingPage() {
  const params = useParams<{ karaokeId: string }>();
  const searchParams = useSearchParams();
  const karaokeId = params.karaokeId;

  const [karaoke, setKaraoke] = useState<Karaoke | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<SelectedMenuItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    guestCount: "2",
  });
  const [feedback, setFeedback] = useState<{
    type: "error" | "info";
    message: string;
  } | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return { date, dateStr: date.toISOString().split("T")[0] };
  }), []);

  useEffect(() => {
    const fetchKaraoke = async () => {
      if (karaokeId === "sample") {
        const fallbackName = searchParams.get("name") || "Sample Karaoke";
        const fallbackLocation = searchParams.get("location") || "Location unavailable";
        const [address, city] = fallbackLocation.split(",").map((item) => item.trim());
        setKaraoke({
          _id: "sample",
          name: fallbackName,
          address: address || fallbackLocation,
          city: city || "City unavailable",
          phone: "Not available yet",
          description: "This venue page is ready for booking details.",
          openingTime: searchParams.get("hours")?.split("–")[0]?.trim() || "18:00",
          closingTime: searchParams.get("hours")?.split("–")[1]?.trim() || "02:00",
          image: searchParams.get("image") || "/karaoke.jpg",
          rooms: [],
          menu: [],
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiRootUrl}/karaoke/${karaokeId}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch karaoke");
        const data = (await response.json()) as { karaoke?: Karaoke };
        const karaokeData = data.karaoke ?? null;
        setKaraoke(karaokeData);
        setSelectedRoomId(karaokeData?.rooms?.[0]?._id ?? "");
        setSelectedSlots([]);
        setFeedback(null);
      } catch (error) {
        console.error("Failed to load booking page:", error);
        setFeedback({ type: "error", message: "Failed to load karaoke details." });
      } finally {
        setLoading(false);
      }
    };

    if (karaokeId) fetchKaraoke();
  }, [karaokeId, searchParams]);

  const selectedRoom = useMemo(
    () => karaoke?.rooms?.find((room) => room._id === selectedRoomId) ?? null,
    [karaoke?.rooms, selectedRoomId]
  );

  const ratingLabel = searchParams.get("rating") || "4.8";
  const fallbackPriceLabel = searchParams.get("price") || "Price unavailable";

  const timeSlots = useMemo(() => {
    const openMinutes = parseTimeToMinutes(karaoke?.openingTime || "");
    const closeMinutes = parseTimeToMinutes(karaoke?.closingTime || "");
    if (openMinutes == null || closeMinutes == null) return [];
    const normalizedCloseMinutes = closeMinutes <= openMinutes ? closeMinutes + 24 * 60 : closeMinutes;
    const slots: string[] = [];
    for (let current = openMinutes; current < normalizedCloseMinutes; current += 60) {
      slots.push(formatMinutesToTime(current));
    }
    return slots;
  }, [karaoke?.closingTime, karaoke?.openingTime]);

  const menuByCategory = useMemo(() => {
    const menu = karaoke?.menu ?? [];
    const categories = ["food", "drink", "set"];
    return categories
      .map(cat => ({
        category: cat,
        items: menu.filter(m => m.category === cat),
      }))
      .filter(g => g.items.length > 0);
  }, [karaoke?.menu]);

  const menuTotal = selectedMenuItems.reduce((sum, { item, quantity }) => sum + (item.price ?? 0) * quantity, 0);
  const roomTotal = selectedRoom ? selectedRoom.price * selectedSlots.length : 0;
  const estimatedTotal = roomTotal + menuTotal;

  const getValidationMessage = () => {
    if (!karaoke || karaoke._id === "sample") {
      return "This sample card is not linked to a live karaoke yet.";
    }

    if (!selectedRoom) {
      return "Please select a room.";
    }

    if (!formData.customerName.trim() || !formData.customerPhone.trim() || !selectedDate || !selectedSlots.length) {
      return "Please fill in all booking details.";
    }

    return null;
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((item) => item !== slot) : [...prev, slot]
    );
  };

  const updateMenuQuantity = (item: MenuItem, delta: number) => {
    setSelectedMenuItems(prev => {
      const existing = prev.find(m => m.item._id === item._id);
      if (!existing) {
        if (delta > 0) return [...prev, { item, quantity: 1 }];
        return prev;
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter(m => m.item._id !== item._id);
      return prev.map(m => m.item._id === item._id ? { ...m, quantity: newQty } : m);
    });
  };

  const getQuantity = (itemId?: string) =>
    selectedMenuItems.find(m => m.item._id === itemId)?.quantity ?? 0;

  const handleStripeCheckout = async () => {
    const validationMessage = getValidationMessage();

    if (validationMessage) {
      setFeedback({ type: "error", message: validationMessage });
      return;
    }

    if (!karaoke || !selectedRoom) {
      return;
    }

    try {
      setPaymentLoading(true);
      setFeedback(null);

      const orderResponse = await api.post("/orders", {
        karaokeId: karaoke._id,
        roomId: selectedRoom._id,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        bookingDate: selectedDate,
        bookingSlots: selectedSlots,
        guestCount: Number(formData.guestCount) || 1,
        menuItems: selectedMenuItems.map(({ item, quantity }) => ({
          itemId: item._id,
          name: item.name,
          price: item.price ?? 0,
          quantity,
        })),
        totalAmount: estimatedTotal > 0 ? estimatedTotal : selectedRoom.price,
        status: "pending",
        paymentStatus: "unpaid",
      });

      const bookingId = orderResponse.data?.order?._id;

      if (!bookingId || typeof bookingId !== "string") {
        throw new Error("Booking draft was not created");
      }

      const response = await api.post("/payments/create-checkout-session", {
        bookingId,
        roomName: `${karaoke.name} - ${selectedRoom.name}`,
        amount: estimatedTotal > 0 ? estimatedTotal : selectedRoom.price,
      });

      const checkoutUrl = response.data?.url;

      if (!checkoutUrl || typeof checkoutUrl !== "string") {
        throw new Error("Stripe checkout URL was not returned");
      }

      window.location.assign(checkoutUrl);
    } catch (error) {
      console.error("Stripe checkout failed:", error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to start Stripe Checkout"
        : "Failed to start Stripe Checkout";

      setFeedback({ type: "error", message });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <main className="container mx-auto px-6 py-16">Loading booking details...</main>;
  if (!karaoke) return <main className="container mx-auto px-6 py-16">Karaoke not found.</main>;

  return (
    <main className="container mx-auto px-6 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">

        {/* Left */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative h-72">
            <img src={karaoke.image || "/karaoke.jpg"} alt={karaoke.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl font-bold text-white">{karaoke.name}</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/90">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{karaoke.address}, {karaoke.city}</span>
                <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{karaoke.openingTime} - {karaoke.closingTime}</span>
                <span className="flex items-center gap-2"><Phone className="h-4 w-4" />{karaoke.phone}</span>
                <span className="flex items-center gap-2"><Star className="h-4 w-4 fill-primary text-primary" />{ratingLabel} / 5.0</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <h2 className="text-lg font-semibold">About This Venue</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{karaoke.description}</p>
            </div>

            {/* Rooms Section - Minimal Image Design */}
<div>
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-black italic uppercase tracking-tighter">Өрөө сонгох</h2>
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-secondary px-3 py-1 rounded-full">
      {(karaoke.rooms ?? []).length} боломжит
    </span>
  </div>
  
  {(karaoke.rooms ?? []).length ? (
    <div className="mt-4 grid gap-4">
      {(karaoke.rooms ?? []).map((room) => {
        const selected = room._id === selectedRoomId;
        return (
          <button
            key={room._id}
            type="button"
            onClick={() => { setSelectedRoomId(room._id); setSelectedSlots([]); }}
            className={[
              "group relative flex items-center gap-5 rounded-[2rem] border p-3 pl-3 pr-6 transition-all duration-500",
              selected 
                ? "border-primary bg-primary/5 shadow-[0_20px_40px_rgba(0,0,0,0.1)] scale-[1.02]" 
                : "border-white/5 bg-card/40 hover:border-white/20 hover:bg-card"
            ].join(" ")}
          >
            {/* Room Image - Minimalist Square */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.4rem] border border-white/10 shadow-lg rounded-full">
              <img 
                src={room.image || "/karaoke.jpg"} 
                alt={room.name} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-full" 
              />
              {selected && (
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className="flex flex-1 items-center justify-between">
              <div className="space-y-1">
                <p className={`font-black uppercase tracking-tight text-base transition-colors ${selected ? "text-primary" : "text-foreground"}`}>
                  {room.name}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {room.capacity} хүн
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/10" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {room.type}
                  </span>
                </div>
              </div>

              {/* Price Tag */}
              <div className="text-right">
                <p className={`text-lg font-black tracking-tighter transition-all ${selected ? "text-primary scale-110" : "text-foreground/80"}`}>
                  ₮{room.price.toLocaleString()}
                </p>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-0.5">цаг / hr</p>
              </div>
            </div>

            {/* Selected Indicator Dot */}
            {selected && (
              <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary border-4 border-background shadow-lg" />
            )}
          </button>
        );
      })}
    </div>
  ) : (
    <div className="mt-4 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Өрөөний мэдээлэл удахгүй...</p>
    </div>
  )}
</div>

            {/* Menu by category */}
          {/* --- Зассан Menu хэсэг --- */}
<div className="space-y-10">
  <div className="flex items-center justify-between mb-2">
    <h2 className="text-xl font-black italic uppercase tracking-tighter">Меню</h2>
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-secondary px-3 py-1 rounded-full">
      {(karaoke.menu ?? []).length} сонголт
    </span>
  </div>

  {menuByCategory.length > 0 ? (
    <div className="mt-4 space-y-12">
      {menuByCategory.map(({ category, items }) => (
        <div key={category} className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2 ml-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          
          <div className="grid gap-4 md:grid-cols-1">
            {items.map((item, index) => {
              const qty = getQuantity(item._id);
              const hasQty = qty > 0;
              
              return (
                <div
                  key={item._id || `${item.name}-${index}`}
                  className={[
                    "group relative flex items-center gap-5 rounded-[2.5rem] border p-3 pl-3 pr-6 transition-all duration-500",
                    hasQty 
                      ? "border-primary bg-primary/5 shadow-[0_20px_40px_rgba(0,0,0,0.1)] scale-[1.01]" 
                      : "border-white/5 bg-card/40 hover:border-white/20 hover:bg-card"
                  ].join(" ")}
                >
                  {/* Item Image - Round & Minimal */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/10 shadow-lg bg-white/5 flex items-center justify-center">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <Utensils className="h-6 w-6 text-white/10" />
                    )}
                    {hasQty && (
                      <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-xl font-black text-white drop-shadow-md">{qty}</span>
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className={`font-black uppercase tracking-tight text-base truncate transition-colors ${hasQty ? "text-primary" : "text-foreground"}`}>
                        {item.name || "Нэргүй"}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground line-clamp-1 leading-relaxed opacity-60">
                        {item.description || "Амт чанартай шинэ бүтээгдэхүүн"}
                      </p>
                    </div>

                    {/* Price & Modern Controls */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <p className={`text-lg font-black tracking-tighter transition-all ${hasQty ? "text-primary scale-105" : "text-foreground/80"}`}>
                          ₮{item.price?.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-black/20 rounded-full p-1 border border-white/5 backdrop-blur-md">
                        {hasQty && (
                          <button
                            type="button"
                            onClick={() => updateMenuQuantity(item, -1)}
                            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => updateMenuQuantity(item, 1)}
                          className={[
                            "h-8 w-8 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg",
                            hasQty ? "bg-primary text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                          ].join(" ")}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Сонгогдсон үед харагдах жижиг цэг */}
                  {hasQty && (
                    <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary border-4 border-background shadow-lg" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="mt-4 rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
           <Utensils className="h-6 w-6 text-white/10" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Меню удахгүй...</p>
      </div>
    </div>
  )}
</div>
          </div>
        </section>

        {/* Right - Booking form */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Complete Your Booking</h2>
          <p className="mt-2 text-sm text-muted-foreground">Songoson medeellee shalgaad zahialgaa ilgeene uu.</p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Your name</span>
              <input
                value={formData.customerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Phone number</span>
              <input
                value={formData.customerPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="Phone number"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </label>

            {/* 7 хоногийн calendar */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4" />
                Select date
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map(day => {
                  const isToday = day.dateStr === todayStr;
                  const isSelected = day.dateStr === selectedDate;
                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => { setSelectedDate(day.dateStr); setSelectedSlots([]); }}
                      className={["relative flex flex-col items-center rounded-2xl border py-3 transition-all duration-200", isSelected ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"].join(" ")}
                    >
                      <span className={`font-black uppercase tracking-widest text-[9px] ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {day.date.toLocaleDateString("mn-MN", { weekday: "short" })}
                      </span>
                      <span className={`mt-1 text-base font-black ${isSelected ? "text-foreground" : "text-foreground/60"}`}>
                        {day.date.getDate()}
                      </span>
                      {isToday && <span className="mt-0.5 text-[8px] font-black text-primary uppercase">өнөөдөр</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Clock3 className="h-4 w-4" />
                Select one or more hours
              </div>
              {timeSlots.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => {
                    const active = selectedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        className={["rounded-xl border px-4 py-3 text-sm font-medium transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50"].join(" ")}
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
                <Users className="h-4 w-4" />Guests
              </span>
              <input
                type="number"
                min="1"
                value={formData.guestCount}
                onChange={(e) => setFormData((prev) => ({ ...prev, guestCount: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </label>
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-2xl bg-muted/40 p-4 space-y-2">
            <p className="text-sm font-medium">Selected room</p>
            <p className="text-lg font-semibold">{selectedRoom?.name || "No room selected"}</p>
            <p className="text-sm text-muted-foreground">
              {selectedRoom ? `${selectedRoom.type} · Up to ${selectedRoom.capacity} guests` : "—"}
            </p>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                📅 {new Date(selectedDate).toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}
            {selectedSlots.length > 0 && (
              <p className="text-sm text-muted-foreground">🕐 {selectedSlots.join(", ")}</p>
            )}
            {selectedMenuItems.length > 0 && (
              <div className="border-t border-border pt-2 mt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Захиалсан меню</p>
                {selectedMenuItems.map(({ item, quantity }) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>{item.name} x{quantity}</span>
                    <span className="text-primary">₮{((item.price ?? 0) * quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedRoom ? (
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Өрөө ({selectedSlots.length || 1} цаг)</span>
                  <span>₮{roomTotal.toLocaleString()}</span>
                </div>
                {menuTotal > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Меню</span>
                    <span>₮{menuTotal.toLocaleString()}</span>
                  </div>
                )}
                <p className="mt-2 text-lg font-bold text-primary">₮{estimatedTotal.toLocaleString()} нийт</p>
              </div>
            ) : (
              <p className="text-lg font-bold text-primary">{fallbackPriceLabel}</p>
            )}
          </div>

          {feedback && (
            <div className={["mt-6 rounded-2xl border px-4 py-3 text-sm", feedback.type === "error" ? "border-red-500/20 bg-red-500/10 text-red-400" : "border-blue-500/20 bg-blue-500/10 text-blue-400"].join(" ")}>
              {feedback.message}
            </div>
          )}

          <Button
            variant="neon"
            className="mt-6 w-full rounded-xl"
            disabled={!selectedRoom || paymentLoading}
            onClick={handleStripeCheckout}
          >
            {paymentLoading
              ? "Redirecting to Stripe..."
              : karaoke._id === "sample"
                ? "Link to live karaoke required"
                : "Confirm Booking"}
          </Button>
        </section>
      </div>

      <ReviewForm karaokeId={karaokeId} />
    </main>
  );
}
