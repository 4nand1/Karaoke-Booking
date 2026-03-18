"use client"

import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Trash2, Phone, Clock, LayoutGrid, 
  UtensilsCrossed, Star, MapPin
} from "lucide-react"

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

export default function AdminDashboard() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  const [karaoke, setKaraoke] = useState<Karaoke | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"rooms" | "menu">("rooms")

  useEffect(() => {
    if (user) fetchKaraoke()
  }, [user])

  async function fetchKaraoke() {
    try {
      const token = await getToken()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/karaoke/mine?ownerClerkUserId=${user?.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        setKaraoke(data)
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
      <button
        onClick={() => router.push("/register-karaoke")}
        className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
      >
        Караоке бүртгэх
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0118] text-white p-6 md:p-12 selection:bg-purple-500/30">
      <div className="mx-auto max-w-5xl space-y-12">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
              <Star size={12} fill="currentColor" /> Admin Panel
            </div>
            <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-500 leading-tight">
              {karaoke.name}
            </h1>
            <div className="flex items-center gap-1.5 font-light text-sm italic text-white/40">
              <MapPin size={16} className="text-purple-500" /> {karaoke.address}, {karaoke.city}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 px-5 py-2 rounded-2xl">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
            <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Active System</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Холбоо барих", value: karaoke.phone, icon: <Phone size={18} /> },
            { label: "Цагийн хуваарь", value: `${karaoke.openingTime} – ${karaoke.closingTime}`, icon: <Clock size={18} /> },
            { label: "Нийт нөөц", value: `${karaoke.rooms.length} Өрөө / ${karaoke.menu.length} Меню`, icon: <LayoutGrid size={18} /> },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] hover:border-purple-500/40 transition-all group">
              <div className="flex items-center gap-3 text-purple-500 mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                {item.icon}
                <p className="text-xs font-black uppercase tracking-widest">{item.label}</p>
              </div>
              <p className="text-xl font-bold text-white/90">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-10 border-b border-white/5">
          {(["rooms", "menu"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-6 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${
                tab === t ? "text-white" : "text-white/20 hover:text-white/40"
              }`}
            >
              {t === "rooms" ? "Rooms" : "Menu"}
              {tab === t && (
                <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
              )}
            </button>
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
            {tab === "rooms" ? (
              <RoomsTab karaoke={karaoke} onRefresh={fetchKaraoke} />
            ) : (
              <MenuTab karaoke={karaoke} onRefresh={fetchKaraoke} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── ROOMS TAB ──────────────────────────────

function RoomsTab({ karaoke, onRefresh }: { karaoke: Karaoke; onRefresh: () => void }) {
  const { getToken } = useAuth()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: "", type: "Small", price: "", capacity: "", image: "" })
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!form.name || !form.price || !form.capacity || !form.image) {
      return alert("Бүх талбарыг бөглөнө үү!")
    }
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/karaoke/${karaoke._id}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rooms: [{ ...form, price: Number(form.price), capacity: Number(form.capacity) }] }),
      })
      if (res.ok) {
        setAdding(false)
        setForm({ name: "", type: "Small", price: "", capacity: "", image: "" })
        onRefresh()
      }
    } finally { setLoading(false) }
  }

  async function handleDelete(roomId: string) {
    if (!confirm("Устгахдаа итгэлтэй байна уу?")) return
    const token = await getToken()
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/karaoke/${karaoke._id}/rooms/${roomId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {karaoke.rooms.map(room => (
          <div key={room._id} className="group flex items-center justify-between rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 hover:border-purple-500/30 transition-all hover:bg-white/[0.04]">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform overflow-hidden">
                {room.image ? (
                  <img src={room.image} alt={room.name} className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  <LayoutGrid size={24} />
                )}
              </div>
              <div>
                <p className="text-xl font-bold">{room.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black uppercase bg-white/5 px-2 py-0.5 rounded text-white/40">{room.type}</span>
                  <p className="text-sm text-white/40 italic">{room.capacity} хүн · <span className="text-purple-400 font-bold">₮{room.price.toLocaleString()}</span></p>
                </div>
              </div>
            </div>
            <button onClick={() => handleDelete(room._id)} className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[2.5rem] border border-purple-500/30 bg-[#160a2c] p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Өрөөний нэр *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition-all" placeholder="VIP Gold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Төрөл</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500">
                <option value="VIP">VIP</option>
                <option value="Medium">Medium</option>
                <option value="Small">Small</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Үнэ /цаг *</label>
              <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500" placeholder="50000" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Багтаамж *</label>
              <input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500" placeholder="10" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Зургийн URL *</label>
              <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition-all" placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={handleAdd} disabled={loading} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-900/40 disabled:opacity-50">
              {loading ? "Saving..." : "Save Room"}
            </button>
            <button onClick={() => setAdding(false)} className="px-8 border border-white/10 rounded-2xl text-white/40 hover:bg-white/5">Cancel</button>
          </div>
        </motion.div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full rounded-[2rem] border-2 border-dashed border-white/5 py-8 text-sm font-black uppercase tracking-widest text-white/20 hover:border-purple-500/40 hover:text-purple-500 transition-all group">
          <span className="flex items-center justify-center gap-3">
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Add New Room
          </span>
        </button>
      )}
    </div>
  )
}

// ─── MENU TAB ───────────────────────────────

function MenuTab({ karaoke, onRefresh }: { karaoke: Karaoke; onRefresh: () => void }) {
  const { getToken } = useAuth()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: "", category: "food", price: "", description: "", image: "" })
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!form.name || !form.price) {
      return alert("Нэр болон үнийг заавал бөглөнө үү!")
    }
    setLoading(true)
    try {
      const token = await getToken()
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/karaoke/${karaoke._id}/menu`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ items: [{ ...form, price: Number(form.price) }] }),
})
      if (res.ok) {
        setAdding(false)
        setForm({ name: "", category: "food", price: "", description: "", image: "" })
        onRefresh()
      }
    } finally { setLoading(false) }
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Устгахдаа итгэлтэй байна уу?")) return
    const token = await getToken()
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/karaoke/${karaoke._id}/menu/${itemId}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
})
    onRefresh()
  }

  return (
    <div className="space-y-8">
      {["food", "drink", "set"].map(cat => {
        const items = karaoke.menu.filter(m => m.category === cat)
        if (items.length === 0) return null
        return (
          <div key={cat} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500/60 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-purple-500" /> {cat} items
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {items.map(item => (
                <div key={item._id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <UtensilsCrossed size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-white/40 font-light">₮{item.price.toLocaleString()} {item.description && `· ${item.description}`}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(item._id)} className="text-white/10 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {adding ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2.5rem] border border-purple-500/30 bg-[#160a2c] p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Нэр *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500" placeholder="Chicken wings" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Ангилал</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as any }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500">
                <option value="food">Food</option>
                <option value="drink">Drink</option>
                <option value="set">Set</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Үнэ (₮) *</label>
              <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500" placeholder="15000" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Тайлбар</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500" placeholder="Optional" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Зургийн URL</label>
              <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500" placeholder="https://... (optional)" />
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={handleAdd} disabled={loading} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-900/40 disabled:opacity-50">
              {loading ? "Saving..." : "Add Item"}
            </button>
            <button onClick={() => setAdding(false)} className="px-8 border border-white/10 rounded-2xl text-white/40 hover:bg-white/5">Cancel</button>
          </div>
        </motion.div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full rounded-[2rem] border-2 border-dashed border-white/5 py-8 text-sm font-black uppercase tracking-widest text-white/20 hover:border-purple-500/40 hover:text-purple-500 transition-all">
          + Add Menu Item
        </button>
      )}
    </div>
  )
}