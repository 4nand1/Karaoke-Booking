"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Plus, Trash2, UtensilsCrossed } from "lucide-react"
import { apiRootUrl } from "@/lib/api-url"

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
  rooms: any[]
  menu: MenuItem[]
  name: string
  address: string
  city: string
  phone: string
  description: string
  openingTime: string
  closingTime: string
}

export function MenuTab({ karaoke, onRefresh }: { karaoke: Karaoke; onRefresh: () => void }) {
  const { getToken } = useAuth()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: "", category: "food", price: "", description: "", image: "" })
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!form.name || !form.price) return alert("Нэр болон үнийг заавал бөглөнө үү!")
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/menu`, {
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
    await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/menu/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    onRefresh()
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Меню</h2>
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