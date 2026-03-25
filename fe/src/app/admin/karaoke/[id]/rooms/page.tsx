"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Star, Trash2 } from "lucide-react"
import { apiRootUrl } from "@/lib/api-url"
import Iridescence from "@/components/Iridescence"
import { Button } from "@/components/ui/button"
import { ImageUploadField } from "@/components/ui/image-upload-field"

type RoomType = "VIP" | "Medium" | "Small"

type Room = {
  id: string
  name: string
  type: RoomType
  price: string
  capacity: string
  image: string
}

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function RoomCard({
  room,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  room: Room
  index: number
  onUpdate: (id: string, field: keyof Room, value: string) => void
  onRemove: (id: string) => void
  canRemove: boolean
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-black uppercase tracking-widest text-white/70">
          Room {index + 1}
        </span>
        {canRemove && (
          <button
            onClick={() => onRemove(room.id)}
            className="rounded-full p-2 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/30">
              Room name
            </label>
            <input
              value={room.name}
              onChange={e => onUpdate(room.id, "name", e.target.value)}
              placeholder="e.g. Galaxy Room"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/30">
              Type
            </label>
            <select
              value={room.type}
              onChange={e => onUpdate(room.id, "type", e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-all focus:border-purple-500"
            >
              <option value="VIP">VIP</option>
              <option value="Medium">Medium</option>
              <option value="Small">Small</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/30">
              Price / hr (₮)
            </label>
            <input
              type="number"
              value={room.price}
              onChange={e => onUpdate(room.id, "price", e.target.value)}
              placeholder="50000"
              min="0"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/30">
              Capacity
            </label>
            <input
              type="number"
              value={room.capacity}
              onChange={e => onUpdate(room.id, "capacity", e.target.value)}
              placeholder="10"
              min="1"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <ImageUploadField
            label="Image *"
            value={room.image ? [room.image] : []}
            onChange={(images) => onUpdate(room.id, "image", images[0] ?? "")}
            theme="dark"
            required
            helperText="Choose a room image from your device."
          />
        </div>
      </div>
    </div>
  )
}

export default function RoomsSetupPage() {
  const router = useRouter()
  const params = useParams()
  const { getToken } = useAuth()
  const karaokeId = params?.id as string

  const [rooms, setRooms] = useState<Room[]>([
    { id: generateId(), name: "", type: "Small", price: "", capacity: "", image: "" },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function addRoom() {
    setRooms(prev => [
      ...prev,
      { id: generateId(), name: "", type: "Small", price: "", capacity: "", image: "" },
    ])
  }

  function updateRoom(id: string, field: keyof Room, value: string) {
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function removeRoom(id: string) {
    setRooms(prev => prev.filter(r => r.id !== id))
  }

  async function handleSubmit() {
    const isValid = rooms.every(r => r.name && r.price && r.capacity && r.image)
    if (!isValid) {
      setError("Please fill in all fields for every room.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = await getToken()
      const payload = rooms.map(({ name, type, price, capacity, image }) => ({
        name,
        type,
        price: Number(price),
        capacity: Number(capacity),
        image,
      }))

      const res = await fetch(
        `${apiRootUrl}/karaoke/${karaokeId}/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rooms: payload }),
        }
      )

      const contentType = res.headers.get("content-type") || ""
      const data =
        contentType.includes("application/json")
          ? await res.json()
          : await res.text()

      if (!res.ok) {
        throw new Error(
          typeof data === "string" ? data : data.message || "Failed to save rooms"
        )
      }

      router.push("/admin")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0118]">
      <div className="fixed inset-0 z-0">
        <Iridescence color={[0.5, 0.6, 0.8]} mouseReact amplitude={0.1} speed={1} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-3xl"
        >
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-400">
              <Star size={12} fill="currentColor" /> Step 2 of 2
            </div>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              Add Your <span className="text-purple-500">Rooms</span>
            </h1>
            <p className="mt-3 text-sm text-white/45">
              Add at least one room to complete your karaoke setup
            </p>
          </div>

          <div className="space-y-4 rounded-[2.5rem] border border-white/10 bg-black/35 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
            <div className="space-y-3">
              {rooms.map((room, i) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  index={i}
                  onUpdate={updateRoom}
                  onRemove={removeRoom}
                  canRemove={rooms.length > 1}
                />
              ))}
            </div>

            <button
              onClick={addRoom}
              className="w-full rounded-[1.5rem] border-2 border-dashed border-white/10 py-4 text-sm font-black uppercase tracking-widest text-white/45 transition-all hover:border-purple-500/40 hover:text-purple-400"
            >
              <span className="flex items-center justify-center gap-3">
                <Plus size={18} /> Add another room
              </span>
            </button>

            {error && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button
              onClick={handleSubmit}
              variant="neon"
              disabled={loading}
              className="h-auto w-full rounded-[1.5rem] px-6 py-4 text-sm font-black uppercase tracking-widest"
            >
              {loading ? "Saving..." : "Save rooms & finish"}
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
