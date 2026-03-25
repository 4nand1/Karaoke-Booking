"use client"

import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Phone, Clock, LayoutGrid, UtensilsCrossed, Star, 
  MapPin, ShoppingBag, ChevronRight, Plus, Edit2, Save, X, Trash2, Loader2, AlertTriangle
} from "lucide-react"
import { apiRootUrl } from "@/lib/api-url"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RoomsTab } from "@/_components/admin/RoomsTab"
import { MenuTab } from "@/_components/admin/MenuTab"
import { OrdersTab } from "@/_components/admin/OrdersTab"

// --- Types ---
type Karaoke = {
  _id: string
  name: string
  address: string
  city: string
  phone: string
  description: string
  openingTime: string
  closingTime: string
  images: string[] // URL массивыг ашиглана
  rooms: any[]
  menu: any[]
}

type Tab = "venues" | "rooms" | "menu" | "orders" | "edit_venue"

export default function AdminDashboard() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  const [karaokes, setKaraokes] = useState<Karaoke[]>([])
  const [selectedKaraokeId, setSelectedKaraokeId] = useState("")
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("venues")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Edit Form State
  const [editFormData, setEditFormData] = useState<Partial<Karaoke>>({
    images: [], // Анхны утга хоосон массив
  })

  useEffect(() => {
    if (user) fetchKaraokes()
  }, [user])

  const currentKaraoke = karaokes.find((k) => k._id === selectedKaraokeId) ?? karaokes[0] ?? null

  async function fetchKaraokes() {
    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/mine?ownerClerkUserId=${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data.karaokes) ? data.karaokes : (data.karaoke ? [data.karaoke] : [])
        setKaraokes(list)
        if (!selectedKaraokeId && list.length > 0) setSelectedKaraokeId(list[0]._id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Засах горим руу шилжих
  const openEditMode = (venue: Karaoke) => {
    setEditFormData({
      ...venue,
      images: venue.images || [], // Зургийн массивыг заавал оноож өгөх
    })
    setTab("edit_venue")
  }

  // Мэдээлэл шинэчлэх (Update Logic)
  const handleUpdateVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/${editFormData._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editFormData)
      })

      if (res.ok) {
        await fetchKaraokes()
        setTab("venues")
      }
    } catch (error) {
      console.error("Update failed:", error)
    } finally {
      setSubmitting(false)
    }
  }

  // Караоке устгах (Delete Logic)
  const handleDeleteVenue = async (karaokeId: string) => {
    if (!window.confirm("Энэ караокеныг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.")) {
      return
    }
    setDeleting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/${karaokeId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      })

      if (res.ok) {
        await fetchKaraokes()
        if (selectedKaraokeId === karaokeId) {
          setSelectedKaraokeId(karaokes.find(k => k._id !== karaokeId)?._id ?? "")
        }
        setTab("venues") // Устгасны дараа жагсаалт руу буцна
      } else {
        alert("Устгахад алдаа гарлаа.")
      }
    } catch (error) {
      console.error("Delete failed:", error)
    } finally {
      setDeleting(false)
    }
  }

  const imageUrl = editFormData.images?.[0] || ""

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0118]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#020005] text-white font-sans selection:bg-purple-500/30">
      {/* --- Sidebar --- */}
      <aside className={`${sidebarOpen ? "w-72" : "w-20"} transition-all duration-500 flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-3xl shrink-0 z-50`}>
        <div className="p-6 flex items-center gap-4 border-b border-white/5">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Star size={20} fill="white" />
          </div>
          {sidebarOpen && <span className="font-black tracking-[0.2em] uppercase text-sm">Admin</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "venues", label: "Миний газрууд", icon: <LayoutGrid size={18} /> },
            { id: "rooms", label: "Өрөөнүүд", icon: <Star size={18} /> },
            { id: "menu", label: "Меню", icon: <UtensilsCrossed size={18} /> },
            { id: "orders", label: "Захиалга", icon: <ShoppingBag size={18} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                tab === t.id ? "bg-purple-600/20 text-purple-400 border border-purple-500/20" : "text-white/30 hover:bg-white/5 hover:text-white"
              }`}
            >
              {t.icon}
              {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>}
            </button>
          ))}
        </nav>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-6 text-white/20 hover:text-white transition-all flex justify-center">
          <ChevronRight size={20} className={sidebarOpen ? "rotate-180" : ""} />
        </button>
      </aside>

      {/* --- Main --- */}
      <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_50%_-20%,#1e0b36,transparent)]">
        <div className="max-w-5xl mx-auto p-8 md:p-12">
          
          <AnimatePresence mode="wait">
            {/* 1. Venues List */}
            {tab === "venues" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
                <header className="flex justify-between items-end border-b border-white/5 pb-10">
                  <div className="space-y-2">
                    <p className="text-purple-500 text-[10px] font-black uppercase tracking-[0.4em]">Dashboard</p>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter">Миний газрууд</h1>
                  </div>
                  <Button onClick={() => router.push("/register-karaoke")} variant="neon" className="rounded-2xl px-8 h-12 font-black uppercase text-[10px] tracking-widest">
                    <Plus className="mr-2" size={16} /> Салбар нэмэх
                  </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {karaokes.map((v) => (
                    <div key={v._id} className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/40 transition-all duration-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <button onClick={() => openEditMode(v)} className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
                          <Edit2 size={16} />
                        </button>
                        {/* Жагсаалт дээр шууд устгах товч */}
                        <button onClick={() => handleDeleteVenue(v._id)} className="h-10 w-10 rounded-full bg-red-600/10 hover:bg-red-600 flex items-center justify-center border border-red-600/30 transition-colors">
                          <Trash2 size={16} className="text-red-400 group-hover:text-white" />
                        </button>
                      </div>
                      <h3 className="text-2xl font-black mb-2">{v.name}</h3>
                      <p className="text-white/40 text-xs mb-6 flex items-center gap-2 italic"><MapPin size={12} /> {v.address}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Button onClick={() => { setSelectedKaraokeId(v._id); setTab("rooms"); }} className="rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest h-11">Удирдах</Button>
                        <div className="flex items-center justify-center text-[10px] text-white/30 uppercase font-black border border-white/5 rounded-xl">{v.rooms.length} өрөө</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 2. Edit Venue Mode */}
            {tab === "edit_venue" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto">
                <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 md:p-12 backdrop-blur-3xl shadow-2xl relative">
                  <button onClick={() => setTab("venues")} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={24} /></button>
                  
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter">Салбар засах</h2>
                      <p className="text-white/40 text-xs mt-2 uppercase font-black tracking-widest">Салбарын мэдээлэл болон зургийг шинэчлэх</p>
                    </div>
                    {/* Засах горим доторх устгах товч */}
                    <Button 
                      disabled={deleting} 
                      onClick={() => handleDeleteVenue(editFormData._id!)} 
                      variant="destructive" 
                      className="rounded-xl h-11 px-6 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                    >
                      {deleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} Устгах
                    </Button>
                  </div>
                  
                  <form onSubmit={handleUpdateVenue} className="space-y-10">
                    {/* Зургийн URL Section */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Салбарын зураг (Image URL)</label>
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Input 
                          value={imageUrl} 
                          placeholder="https://example.com/image.jpg"
                          onChange={e => setEditFormData({...editFormData, images: [e.target.value]})} 
                          className="h-14 flex-1 rounded-2xl bg-white/5 border-white/10 focus:border-purple-500 font-bold" 
                        />
                        {imageUrl && (
                          <div className="h-14 w-14 rounded-2xl border border-white/10 overflow-hidden shrink-0 bg-white/5 flex items-center justify-center">
                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Нэр</label>
                        <Input value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-purple-500 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Утас</label>
                        <Input value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Хот</label>
                        <Input value={editFormData.city} onChange={e => setEditFormData({...editFormData, city: e.target.value})} className="h-14 rounded-2xl bg-white/5 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Хаяг</label>
                        <Input value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Нээх цаг</label>
                        <Input type="time" value={editFormData.openingTime} onChange={e => setEditFormData({...editFormData, openingTime: e.target.value})} className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Хаах цаг</label>
                        <Input type="time" value={editFormData.closingTime} onChange={e => setEditFormData({...editFormData, closingTime: e.target.value})} className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Тайлбар</label>
                      <Textarea value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} className="rounded-[2rem] bg-white/5 border-white/10 min-h-[120px] p-6 font-medium" />
                    </div>

                    <Button disabled={submitting} type="submit" variant="neon" className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20">
                      {submitting ? "Хадгалж байна..." : <><Save className="mr-2" size={18} /> Шинэчлэх</>}
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* 3. Sub Tabs (Rooms, Menu, Orders) */}
            {["rooms", "menu", "orders"].includes(tab) && currentKaraoke && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-10">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">{currentKaraoke.name} <span className="text-purple-500">/ {tab}</span></h2>
                  <select 
                    value={selectedKaraokeId} 
                    onChange={(e) => setSelectedKaraokeId(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
                  >
                    {karaokes.map(k => <option key={k._id} value={k._id} className="bg-[#0a0118]">{k.name}</option>)}
                  </select>
                </div>
                
                {tab === "rooms" && <RoomsTab karaoke={currentKaraoke} onRefresh={fetchKaraokes} />}
                {tab === "menu" && <MenuTab karaoke={currentKaraoke} onRefresh={fetchKaraokes} />}
                {tab === "orders" && <OrdersTab karaokeId={currentKaraoke._id} karaoke={currentKaraoke} onPendingCount={() => {}} />}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  )
}