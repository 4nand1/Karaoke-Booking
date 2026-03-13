"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter, useParams } from "next/navigation"

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
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Room {index + 1}</span>
        {canRemove && (
          <button
            onClick={() => onRemove(room.id)}
            className="text-sm text-gray-400 hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Room name</label>
            <input
              value={room.name}
              onChange={e => onUpdate(room.id, "name", e.target.value)}
              placeholder="e.g. Galaxy Room"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
            <select
              value={room.type}
              onChange={e => onUpdate(room.id, "type", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              <option value="VIP">VIP</option>
              <option value="Medium">Medium</option>
              <option value="Small">Small</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Price / hr (₮)</label>
            <input
              type="number"
              value={room.price}
              onChange={e => onUpdate(room.id, "price", e.target.value)}
              placeholder="50000"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Capacity</label>
            <input
              type="number"
              value={room.capacity}
              onChange={e => onUpdate(room.id, "capacity", e.target.value)}
              placeholder="10"
              min="1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Image URL</label>
          <input
            value={room.image}
            onChange={e => onUpdate(room.id, "image", e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
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
        `${process.env.NEXT_PUBLIC_API_URL}/karaoke/${karaokeId}/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rooms: payload }),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to save rooms")

      router.push("/admin/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-400">Step 2 of 2</p>
          <h1 className="text-2xl font-bold text-gray-900">Add your rooms</h1>
          <p className="mt-1 text-sm text-gray-500">Add at least one room to complete setup</p>
        </div>

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
          className="mt-3 w-full rounded-xl border border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          + Add another room
        </button>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save rooms & finish"}
        </button>
      </div>
    </div>
  )
}