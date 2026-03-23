"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Plus, Trash2, LayoutGrid } from "lucide-react"
import { apiRootUrl } from "@/lib/api-url"

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

export function RoomsTab({ karaoke, onRefresh }: { karaoke: Karaoke; onRefresh: () => void }) {
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
      const res = await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/rooms`, {
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
    await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/rooms/${roomId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Өрөөнүүд</h2>
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