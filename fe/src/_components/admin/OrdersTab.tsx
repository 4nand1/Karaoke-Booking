"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, Clock, ShoppingBag, ChevronRight } from "lucide-react"
import { apiRootUrl } from "@/lib/api-url"
import { DetailItem } from "./DetailItem"

type Order = {
  _id: string
  customerName?: string
  customerPhone?: string
  roomId?: string
  bookingDate?: string
  bookingSlots?: string[]
  guestCount?: number
  totalAmount?: number
  status?: "pending" | "confirmed" | "cancelled"
  paymentStatus?: "unpaid" | "paid" | "refunded"
  stripeSessionId?: string | null
  createdAt?: string
  menuItems?: {
    itemId?: string
    name?: string
    price?: number
    quantity?: number
  }[]
}

type Room = {
  _id: string
  name: string
  type: "VIP" | "Medium" | "Small"
  price: number
  capacity: number
  image: string
  isAvailable: boolean
}

type Karaoke = {
  _id: string
  rooms: Room[]
  menu: any[]
  name: string
  address: string
  city: string
  phone: string
  description: string
  openingTime: string
  closingTime: string
}

export function OrdersTab({
  karaokeId,
  karaoke,
  onPendingCount,
}: {
  karaokeId: string
  karaoke: Karaoke
  onPendingCount: (count: number) => void
}) {
  const { getToken } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const todayStr = new Date().toISOString().split("T")[0]

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return { date, dateStr: date.toISOString().split("T")[0] }
  })

  const parseTimeToMinutes = (value: string) => {
    const match = value.match(/(\d{1,2})(?::(\d{2}))?/)
    if (!match) return null
    return Number(match[1]) * 60 + Number(match[2] || "0")
  }

  const formatTime = (minutes: number) => {
    const norm = ((minutes % 1440) + 1440) % 1440
    return `${Math.floor(norm / 60).toString().padStart(2, "0")}:59`
  }

  const timeSlots = (() => {
    const open = parseTimeToMinutes(karaoke.openingTime)
    const close = parseTimeToMinutes(karaoke.closingTime)
    if (open == null || close == null) return []
    const normalizedClose = close <= open ? close + 1440 : close
    const slots = []
    for (let t = open; t < normalizedClose; t += 60) slots.push(formatTime(t))
    return slots
  })()

  useEffect(() => { fetchOrders() }, [karaokeId])

  async function fetchOrders() {
    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/api/orders?karaokeId=${karaokeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
        onPendingCount(data.filter((o: Order) => o.status === "pending").length)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function updateStatus(orderId: string, status: "confirmed" | "cancelled") {
    const token = await getToken()
    const res = await fetch(`${apiRootUrl}/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders(prev => {
        const updated = status === "cancelled"
          ? prev.filter(o => o._id !== orderId)
          : prev.map(o => o._id === orderId ? { ...o, status } : o)
        onPendingCount(updated.filter(o => o.status === "pending").length)
        return updated
      })
    }
  }

  const filteredOrders = orders.filter(o => o.bookingDate === selectedDate)
  const bookedSlots = new Set(filteredOrders.flatMap(o => o.bookingSlots ?? []))
  const slotOrders = selectedSlot
    ? filteredOrders.filter(o => o.bookingSlots?.includes(selectedSlot))
    : filteredOrders

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-purple-500/60 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
          Орж ирсэн захиалгууд
        </h2>
        <button onClick={fetchOrders} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-purple-400 transition-colors">
          Шинэчлэх ↻
        </button>
      </div>

      {/* 7 хоног */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const isToday = day.dateStr === todayStr
          const isSelected = day.dateStr === selectedDate
          const hasOrders = orders.some(o => o.bookingDate === day.dateStr)
          return (
            <button
              key={day.dateStr}
              onClick={() => { setSelectedDate(day.dateStr); setSelectedSlot(null) }}
              className={`relative flex flex-col items-center rounded-[1.5rem] border p-3 transition-all duration-300 ${
                isSelected
                  ? "border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                  : "border-white/5 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <span className={`font-black uppercase tracking-widest text-[9px] ${isSelected ? "text-purple-400" : "text-white/30"}`}>
                {day.date.toLocaleDateString("mn-MN", { weekday: "short" })}
              </span>
              <span className={`mt-1 text-xl font-black ${isSelected ? "text-white" : "text-white/60"}`}>
                {day.date.getDate()}
              </span>
              {isToday && <span className="mt-1 text-[8px] font-black text-purple-400 uppercase">өнөөдөр</span>}
              {hasOrders && !isSelected && (
                <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Цагийн slot-ууд */}
      {timeSlots.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Цагаар шүүх</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {timeSlots.map(slot => {
              const count = filteredOrders.filter(o => o.bookingSlots?.includes(slot)).length
              const isBooked = bookedSlots.has(slot)
              const isSelected = selectedSlot === slot
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(isSelected ? null : slot)}
                  className={`relative rounded-2xl border py-4 text-sm font-bold transition-all duration-300 ${
                    isSelected
                      ? "border-purple-500 bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      : isBooked
                      ? "border-pink-500/20 bg-pink-500/5 text-pink-400 hover:bg-pink-500/10"
                      : "border-white/10 bg-black/60 text-white/50 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {slot}
                  {count > 0 && !isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-pink-500 text-[9px] font-black text-white flex items-center justify-center shadow-[0_0_8px_#ec4899]">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Order жагсаалт */}
      <div className="space-y-4">
        {slotOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
            <div className="p-5 rounded-full bg-white/[0.02] mb-4">
              <ShoppingBag size={32} className="text-white/10" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
              {selectedSlot ? `${selectedSlot} цагт захиалга байхгүй` : "Энэ өдөр захиалга байхгүй"}
            </p>
          </div>
        ) : (
          slotOrders.map(order => (
            <div
              key={order._id}
              className={`group rounded-[2rem] border transition-all duration-300 ${
                expanded === order._id
                  ? "border-purple-500/40 bg-purple-500/[0.04]"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
              }`}
            >
              <div
                className="flex items-center justify-between px-8 py-6 cursor-pointer"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              >
                <div className="flex items-center gap-5">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
                    order.paymentStatus === "paid" || order.status === "confirmed"
                      ? "border-green-500/20 bg-green-500/10 text-green-400"
                      : "border-purple-500/20 bg-purple-500/10 text-purple-400"
                  }`}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                      {order.customerName || "Нэргүй зочин"}
                    </p>
                    <p className="text-xs text-white/40 font-medium">
                      {order.bookingSlots?.join(", ")} · {order.guestCount} хүн
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-white">₮{order.totalAmount?.toLocaleString()}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${
                      order.status === "confirmed" ? "text-green-500" : order.status === "cancelled" ? "text-red-500" : "text-yellow-500"
                    }`}>
                      {order.status ?? "pending"}
                    </p>
                    <p className={`mt-1 text-[9px] font-black uppercase tracking-widest ${
                      order.paymentStatus === "paid" ? "text-emerald-400" : "text-white/30"
                    }`}>
                      {order.paymentStatus === "paid" ? "stripe paid" : "payment pending"}
                    </p>
                  </div>
                  <div className={`p-2 rounded-xl bg-white/5 transition-transform ${expanded === order._id ? "rotate-90 text-purple-400" : "text-white/20"}`}>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expanded === order._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 pt-2 border-t border-white/5 space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <DetailItem label="Өрөө" value={karaoke.rooms.find(r => r._id === order.roomId)?.name} />
                        <DetailItem label="Утас" value={order.customerPhone} icon={<Phone size={10} />} />
                        <DetailItem label="Огноо" value={order.bookingDate} />
                        <DetailItem label="Нийт үнэ" value={`₮${order.totalAmount?.toLocaleString()}`} highlight />
                      </div>
                      <div className={`rounded-2xl border px-4 py-3 text-[11px] font-black uppercase tracking-widest ${
                        order.paymentStatus === "paid"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-white/10 bg-white/[0.02] text-white/40"
                      }`}>
                        {order.paymentStatus === "paid"
                          ? "Stripe payment completed"
                          : "Stripe payment pending"}
                      </div>
                      {order.menuItems && order.menuItems.length > 0 && (
  <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 space-y-2">
    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Захиалсан меню</p>
    {order.menuItems.map((item, i) => (
      <div key={i} className="flex items-center justify-between">
        <span className="text-xs text-white/70">
          {item.name} <span className="text-white/30">x{item.quantity}</span>
        </span>
        <span className="text-xs font-black text-purple-400">
          ₮{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
        </span>
      </div>
    ))}
    <div className="border-t border-white/5 pt-2 flex justify-between">
      <span className="text-[10px] text-white/30 uppercase tracking-widest">Меню нийт</span>
      <span className="text-xs font-black text-purple-400">
        ₮{order.menuItems.reduce((s, m) => s + (m.price ?? 0) * (m.quantity ?? 1), 0).toLocaleString()}
      </span>
    </div>
  </div>
)}
                      <div className="flex gap-3">
                        {order.paymentStatus !== "paid" ? (
                          <>
                            <button
                              type="button"
                              disabled
                              className="flex-1 cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.02] py-4 text-[10px] font-black uppercase tracking-widest text-white/30"
                            >
                              Stripe payment pending
                            </button>
                            <button
                              type="button"
                              disabled
                              className="flex-1 cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.02] py-4 text-[10px] font-black uppercase tracking-widest text-white/30"
                            >
                              Admin action disabled
                            </button>
                          </>
                        ) : order.status === "pending" && (
                          <>
                            <button onClick={e => { e.stopPropagation(); updateStatus(order._id, "confirmed") }}
                              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all">
                              ✓ Баталгаажуулах
                            </button>
                            <button onClick={e => { e.stopPropagation(); updateStatus(order._id, "cancelled") }}
                              className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all">
                              ✕ Цуцлах
                            </button>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <button onClick={e => { e.stopPropagation(); updateStatus(order._id, "cancelled") }}
                            className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            ✕ Захиалга устгах
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
