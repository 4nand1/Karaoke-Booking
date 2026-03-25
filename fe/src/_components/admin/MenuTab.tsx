"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Plus, Trash2, UtensilsCrossed, Edit2, X, Loader2 } from "lucide-react"
import { apiRootUrl } from "@/lib/api-url"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Button } from "@/components/ui/button"

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
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", category: "food", price: "", description: "", image: "" })
  const [loading, setLoading] = useState(false)

  const isShowForm = adding || !!editing

  // ✅ НЭМЭХ
  async function handleAdd() {
    if (!form.name || !form.price) return alert("Нэр болон үнийг заавал бөглөнө үү!")
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: Number(form.price),
          description: form.description,
          image: form.image,
        }),
      })
      if (res.ok) {
        resetForm()
        onRefresh()
      } else {
        const errData = await res.json()
        alert(`Алдаа: ${errData.message || "Нэмж чадсангүй"}`)
      }
    } catch (err) {
      console.error(err)
      alert("Сервертэй холбогдоход алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  // ✅ ЗАСАХ ЭХЛҮҮЛЭХ
  function startEdit(item: MenuItem) {
    setEditing(item._id)
    setAdding(false)
    setForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description ?? "",
      image: item.image ?? "",
    })
  }

  // ✅ ШИНЭЧЛЭХ
  async function handleUpdate() {
    if (!form.name || !form.price) return alert("Нэр болон үнийг заавал бөглөнө үү!")
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/menu/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: Number(form.price),
          description: form.description,
          image: form.image,
        }),
      })
      if (res.ok) {
        resetForm()
        onRefresh()
      } else {
        const errData = await res.json()
        alert(`Алдаа: ${errData.message || "Шинэчилж чадсангүй"}`)
      }
    } catch (err) {
      console.error(err)
      alert("Сервертэй холбогдоход алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  // ✅ УСТГАХ
  async function handleDelete(itemId: string) {
    if (!confirm("Энэ хоолыг устгах уу?")) return
    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/menu/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        onRefresh()
      } else {
        alert("Устгаж чадсангүй")
      }
    } catch (err) {
      console.error(err)
      alert("Сервертэй холбогдоход алдаа гарлаа")
    }
  }

  function resetForm() {
    setAdding(false)
    setEditing(null)
    setForm({ name: "", category: "food", price: "", description: "", image: "" })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Меню удирдлага</h2>

      {!isShowForm ? (
        <>
          {["food", "drink", "set"].map((cat) => {
            const items = (karaoke.menu || []).filter((m) => m.category === cat)
            if (items.length === 0) return null
            return (
              <div key={cat} className="space-y-4 mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500/60 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> {cat}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-4 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <UtensilsCrossed size={18} className="text-white/20" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white/90">{item.name}</p>
                          <p className="text-[10px] text-white/40 font-medium">
                            ₮{item.price.toLocaleString()} {item.description && `· ${item.description}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(item)} className="p-2 text-white/20 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <button
            onClick={() => setAdding(true)}
            className="group w-full rounded-[2.5rem] border-2 border-dashed border-white/5 py-10 flex flex-col items-center justify-center gap-3 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
          >
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
              <Plus size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-purple-400">Шинэ хоол нэмэх</span>
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2.5rem] border border-white/10 bg-[#0d041a] p-10 space-y-8 shadow-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">
              {editing ? "Меню засах" : "Шинэ меню нэмэх"}
            </h3>
            <button onClick={resetForm} className="text-white/20 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Нэр *</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-purple-500 font-bold" placeholder="Ж: Шарсан далавч" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Ангилал</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as any }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-purple-500 font-bold">
                <option value="food">Хоол (Food)</option>
                <option value="drink">Ундаа (Drink)</option>
                <option value="set">Сет (Set)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Үнэ (₮) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-purple-500 font-bold text-purple-400" placeholder="0" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Тайлбар</label>
              <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-purple-500" placeholder="Орц найрлага..." />
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                label="Зураг"
                value={form.image ? [form.image] : []}
                onChange={(images) => setForm((prev) => ({ ...prev, image: images[0] ?? "" }))}
                theme="dark"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              disabled={loading}
              onClick={editing ? handleUpdate : handleAdd}
              variant="neon"
              className="flex-1 h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : editing ? "Шинэчлэх" : "Нэмэх"}
            </Button>
            <button onClick={resetForm} className="px-10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/20 hover:bg-white/5 transition-colors">
              Цуцлах
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}