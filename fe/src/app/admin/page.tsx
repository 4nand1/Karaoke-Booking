"use client"

import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, Clock, LayoutGrid, UtensilsCrossed, Star, MapPin, ShoppingBag, ChevronRight } from "lucide-react"
import { apiRootUrl } from "@/lib/api-url"
import { Button } from "@/components/ui/button"
import { RoomsTab } from "@/_components/admin/RoomsTab"
import { MenuTab } from "@/_components/admin/MenuTab"
import { OrdersTab } from "@/_components/admin/OrdersTab"

type Room = {
  _id: string
  name: string
  type: "VIP" | "Medium" | "Small"
  price: number
  capacity: number
  image: string
  isAvailable: boolean
}

type MenuItem = {
  _id: string
  name: string
  category: "food" | "drink" | "set"
  price: number
  description?: string
  image?: string
  isAvailable: boolean
}

type Karaoke = {
  _id: string
  name: string
  address: string
  city: string
  phone: string
  description: string
  openingTime: string
  closingTime: string
  rooms: Room[]
  menu: MenuItem[]
}

type Tab = "rooms" | "menu" | "orders"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "rooms", label: "Өрөөнүүд", icon: <LayoutGrid size={18} /> },
  { id: "menu", label: "Меню", icon: <UtensilsCrossed size={18} /> },
  { id: "orders", label: "Захиалга", icon: <ShoppingBag size={18} /> },
]

export default function AdminDashboard() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [karaokes, setKaraokes] = useState<Karaoke[]>([])
  const [selectedKaraokeId, setSelectedKaraokeId] = useState("")
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("rooms")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [pendingOrderCount, setPendingOrderCount] = useState(0)

  useEffect(() => {
    if (user) fetchKaraoke()
  }, [user])

  // URL parameter-ээс karaoke ID авах
  useEffect(() => {
    const karaokeIdFromUrl = searchParams.get("karaokeId")
    if (karaokeIdFromUrl && karaokes.length > 0) {
      const exists = karaokes.some((k) => k._id === karaokeIdFromUrl)
      if (exists) {
        setSelectedKaraokeId(karaokeIdFromUrl)
      }
    }
  }, [searchParams, karaokes])

  const karaoke =
    karaokes.find((item) => item._id === selectedKaraokeId) ?? karaokes[0] ?? null

  async function fetchKaraoke() {
    try {
      const token = await getToken()
      const res = await fetch(
        `${apiRootUrl}/karaoke/mine?ownerClerkUserId=${user?.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        const nextKaraokes = Array.isArray(data.karaokes)
          ? data.karaokes
          : data.karaoke
            ? [data.karaoke]
            : []

        setKaraokes(nextKaraokes)
        setSelectedKaraokeId((prev) => {
          if (prev && nextKaraokes.some((item: Karaoke) => item._id === prev)) {
            return prev
          }

          return nextKaraokes[0]?._id ?? ""
        })
      }
    } catch (e) {
      console.error("Fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0118]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
    </div>
  )

  if (!karaoke) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0118] text-white">
      <div className="h-20 w-20 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
        <Star size={40} fill="currentColor" />
      </div>
      <p className="text-white/60 font-light">Та одоогоор караоке бүртгүүлээгүй байна.</p>
      <Button
        onClick={() => router.push("/register-karaoke")}
        variant="neon"
        className="h-auto rounded-2xl px-10 py-4 text-sm font-black uppercase tracking-widest"
      >
        Караоке бүртгэх
      </Button>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0a0118] text-white">
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl shrink-0`}>
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0">
            <Star size={14} fill="white" className="text-white" />
          </div>
          {sidebarOpen && <span className="text-sm font-black uppercase tracking-widest text-white/80 truncate">Admin</span>}
          <button onClick={() => setSidebarOpen(p => !p)} className="ml-auto text-white/20 hover:text-white transition-colors">
            <ChevronRight size={16} className={`transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-white/5">
            <p className="text-xs font-black text-white/80 mb-2">Караоке сонго</p>
            <select
              value={selectedKaraokeId}
              onChange={(e) => setSelectedKaraokeId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {karaokes.map((k) => (
                <option key={k._id} value={k._id}>
                  {k.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 mt-2">
              <MapPin size={10} className="text-purple-500 shrink-0" />
              <p className="text-[10px] text-white/30 truncate">{karaoke.city}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left ${
                tab === t.id ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-white/30 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              <span className="shrink-0">{t.icon}</span>
              {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>}
              {t.id === "orders" && pendingOrderCount > 0 && (
                <span className={`${sidebarOpen ? "ml-auto" : "ml-0"} text-[10px] bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full font-black`}>
                  {pendingOrderCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/30 uppercase tracking-widest">Караоке</span>
              <span className="text-white/60 font-black">{karaokes.length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/30 uppercase tracking-widest">Өрөө</span>
              <span className="text-white/60 font-black">{karaoke.rooms.length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/30 uppercase tracking-widest">Меню</span>
              <span className="text-white/60 font-black">{karaoke.menu.length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/30 uppercase tracking-widest">Цаг</span>
              <span className="text-white/60 font-black">{karaoke.openingTime}–{karaoke.closingTime}</span>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                <Star size={12} fill="currentColor" /> Admin Panel
              </div>
              <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-500 leading-tight">
                {karaoke.name}
              </h1>
              <div className="flex items-center gap-1.5 font-light text-sm italic text-white/40">
                <MapPin size={16} className="text-purple-500" /> {karaoke.address}, {karaoke.city}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("/register-karaoke")}
                className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-purple-300 transition-all hover:bg-purple-500/20"
              >
                Add another karaoke
              </button>
              <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 px-5 py-2 rounded-2xl">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>

          {karaokes.length > 1 && (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-4 md:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">
                    Your Karaoke Venues
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    Clerk account нэгээрээ олон karaoke удирдаж болно.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/50">
                  {karaokes.length} total
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {karaokes.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedKaraokeId(item._id)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      item._id === karaoke._id
                        ? "border-purple-500/40 bg-purple-500/10"
                        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <p className="text-sm font-black text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-white/40">{item.address}, {item.city}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-white/30">
                      {item.rooms.length} rooms · {item.menu.length} menu items
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Холбоо барих", value: karaoke.phone, icon: <Phone size={18} /> },
              { label: "Цагийн хуваарь", value: `${karaoke.openingTime} – ${karaoke.closingTime}`, icon: <Clock size={18} /> },
              { label: "Нийт нөөц", value: `${karaoke.rooms.length} Өрөө / ${karaoke.menu.length} Меню`, icon: <LayoutGrid size={18} /> },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 p-5 rounded-[2rem] hover:border-purple-500/40 transition-all group">
                <div className="flex items-center gap-3 text-purple-500 mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                  <p className="text-xs font-black uppercase tracking-widest">{item.label}</p>
                </div>
                <p className="text-lg font-bold text-white/90">{item.value}</p>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "rooms" && <RoomsTab karaoke={karaoke} onRefresh={fetchKaraoke} />}
              {tab === "menu" && <MenuTab karaoke={karaoke} onRefresh={fetchKaraoke} />}
              {tab === "orders" && (
                <OrdersTab karaokeId={karaoke._id} karaoke={karaoke} onPendingCount={setPendingOrderCount} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
