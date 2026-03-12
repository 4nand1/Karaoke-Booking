"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"

interface KaraokePayload {
  name: string
  location: string
  phoneNumber: string
  price: number
  image: string
}

interface RoomPayload {
  name: string
  type: "VIP" | "Medium" | "Small"
  price: number
  capacity: number
  image: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<"karaoke" | "room">("karaoke")
  const [karaokeId, setKaraokeId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rooms, setRooms] = useState<RoomPayload[]>([])

  const [karaokeForm, setKaraokeForm] = useState<KaraokePayload>({
    name: "",
    location: "",
    phoneNumber: "",
    price: 0,
    image: "",
  })

  const [roomForm, setRoomForm] = useState<RoomPayload>({
    name: "",
    type: "VIP",
    price: 0,
    capacity: 0,
    image: "",
  })

  function handleKaraokeChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setKaraokeForm((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }))
  }

  function handleRoomChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setRoomForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "capacity" ? Number(value) : value,
    }))
  }

  async function handleKaraokeSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:5000/karaoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(karaokeForm),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Караокегийн бүртгэл амжилтгүй")
      }

      const data = await res.json()
      setKaraokeId(data._id)
      setStep("room")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  function addRoom() {
    if (!roomForm.name || !roomForm.price || !roomForm.capacity || !roomForm.image) return
    setRooms((prev) => [...prev, roomForm])
    setRoomForm({ name: "", type: "VIP", price: 0, capacity: 0, image: "" })
  }

  function removeRoom(index: number) {
    setRooms((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleRoomsSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (rooms.length === 0) {
      setError("Дор хаяж 1 өрөө нэмнэ үү")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`http://localhost:5000/karaoke/${karaokeId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rooms }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Өрөө бүртгэл амжилтгүй")
      }

      router.push("/admin/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg space-y-6">

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
            ${step === "karaoke" ? "bg-black text-white" : "bg-green-500 text-white"}`}>
            {step === "room" ? "✓" : "1"}
          </div>
          <span className="text-sm font-medium text-gray-700">Каракийн мэдээлэл</span>
          <div className="h-px flex-1 bg-gray-300" />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
            ${step === "room" ? "bg-black text-white" : "bg-gray-200 text-gray-400"}`}>
            2
          </div>
          <span className={`text-sm font-medium ${step === "room" ? "text-gray-700" : "text-gray-400"}`}>
            Өрөөнүүд
          </span>
        </div>

        {/* Step 1 — Karaoke */}
        {step === "karaoke" && (
          <form onSubmit={handleKaraokeSubmit} className="space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold">Каракийн бүртгэл</h1>

            <input
              type="text"
              name="name"
              placeholder="Каракийн нэр"
              value={karaokeForm.name}
              onChange={handleKaraokeChange}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Байршил"
              value={karaokeForm.location}
              onChange={handleKaraokeChange}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
              required
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Утасны дугаар"
              value={karaokeForm.phoneNumber}
              onChange={handleKaraokeChange}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Үнэ (₮)"
              value={karaokeForm.price || ""}
              onChange={handleKaraokeChange}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
              required
              min={0}
            />
            <input
              type="text"
              name="image"
              placeholder="Зургийн URL"
              value={karaokeForm.image}
              onChange={handleKaraokeChange}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
              required
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Бүртгэж байна..." : "Үргэлжлүүлэх →"}
            </button>
          </form>
        )}

        {/* Step 2 — Rooms */}
        {step === "room" && (
          <form onSubmit={handleRoomsSubmit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold">Өрөө нэмэх</h1>

            {/* Нэмсэн өрөөнүүд */}
            {rooms.length > 0 && (
              <div className="space-y-2">
                {rooms.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{r.name}</span>
                      <span className="ml-2 text-gray-400">{r.type} · {r.capacity} хүн · {r.price.toLocaleString()}₮</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRoom(i)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      Устгах
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Өрөө нэмэх form */}
            <div className="space-y-3 rounded-xl border p-4">
              <p className="text-sm font-medium text-gray-600">Шинэ өрөө</p>

              <input
                type="text"
                name="name"
                placeholder="Өрөөний нэр"
                value={roomForm.name}
                onChange={handleRoomChange}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
              />

              <select
                name="type"
                value={roomForm.type}
                onChange={handleRoomChange}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
              >
                <option value="VIP">VIP</option>
                <option value="Medium">Medium</option>
                <option value="Small">Small</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="price"
                  placeholder="Үнэ (₮)"
                  value={roomForm.price || ""}
                  onChange={handleRoomChange}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
                  min={0}
                />
                <input
                  type="number"
                  name="capacity"
                  placeholder="Багтаамж (хүн)"
                  value={roomForm.capacity || ""}
                  onChange={handleRoomChange}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
                  min={1}
                />
              </div>

              <input
                type="text"
                name="image"
                placeholder="Зургийн URL"
                value={roomForm.image}
                onChange={handleRoomChange}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
              />

              <button
                type="button"
                onClick={addRoom}
                disabled={!roomForm.name || !roomForm.price || !roomForm.capacity || !roomForm.image}
                className="w-full rounded-lg border border-black px-4 py-2.5 text-sm font-medium disabled:opacity-40"
              >
                + Өрөө нэмэх
              </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || rooms.length === 0}
              className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Хадгалж байна..." : `Бүртгэлийг дуусгах (${rooms.length} өрөө)`}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}