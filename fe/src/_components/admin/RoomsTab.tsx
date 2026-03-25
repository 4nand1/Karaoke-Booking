"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { BedDouble, Edit3, Plus, Trash2, Users } from "lucide-react"
import { apiRootUrl } from "@/lib/api-url"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
  menu: unknown[]
  name: string
  address: string
  city: string
  phone: string
  description: string
  openingTime: string
  closingTime: string
}

type FormState = {
  name: string
  type: Room["type"]
  price: string
  capacity: string
  image: string
}

const emptyForm: FormState = {
  name: "",
  type: "Small",
  price: "",
  capacity: "",
  image: "",
}

function formatNumberInput(value: string) {
  const digits = value.replace(/\D/g, "")

  if (!digits) return ""

  return Number(digits).toLocaleString()
}

export function RoomsTab({
  karaoke,
  onRefresh,
}: {
  karaoke: Karaoke
  onRefresh: () => void
}) {
  const { getToken } = useAuth()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)

  const isFormOpen = adding || Boolean(editing)
  const roomSummary = useMemo(
    () => ({
      totalRooms: karaoke.rooms.length,
      vipRooms: karaoke.rooms.filter((room) => room.type === "VIP").length,
      avgCapacity: karaoke.rooms.length
        ? Math.round(
            karaoke.rooms.reduce((sum, room) => sum + room.capacity, 0) /
              karaoke.rooms.length
          )
        : 0,
    }),
    [karaoke.rooms]
  )

  async function handleAdd() {
    if (!form.name || !form.price || !form.capacity || !form.image) {
      return alert("Please complete all required room fields.")
    }

    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rooms: [
            {
              ...form,
              price: Number(form.price.replace(/,/g, "")),
              capacity: Number(form.capacity),
            },
          ],
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to add room")
      }

      resetForm()
      onRefresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add room")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate() {
    if (!editing || !form.name || !form.price || !form.capacity || !form.image) {
      return alert("Please complete all required room fields.")
    }

    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(
        `${apiRootUrl}/karaoke/${karaoke._id}/rooms/${editing}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            price: Number(form.price.replace(/,/g, "")),
            capacity: Number(form.capacity),
          }),
        }
      )

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to update room")
      }

      resetForm()
      onRefresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update room")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(roomId: string) {
    if (!confirm("Delete this room?")) return

    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/rooms/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error("Failed to delete room")
      }

      onRefresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete room")
    }
  }

  function startEdit(room: Room) {
    setEditing(room._id)
    setAdding(false)
    setForm({
      name: room.name,
      type: room.type,
      price: room.price.toLocaleString(),
      capacity: String(room.capacity),
      image: room.image,
    })
  }

  function resetForm() {
    setAdding(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const inputClassName =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-200"
  const labelClassName =
    "mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"

  return (
    <div className="space-y-6 text-slate-950 dark:text-slate-50">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Total rooms
          </p>
          <p className="mt-3 text-3xl font-semibold">{roomSummary.totalRooms}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            VIP rooms
          </p>
          <p className="mt-3 text-3xl font-semibold">{roomSummary.vipRooms}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Avg capacity
          </p>
          <p className="mt-3 text-3xl font-semibold">{roomSummary.avgCapacity}</p>
        </div>
      </div>

      {!isFormOpen ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {karaoke.rooms.map((room) => (
              <div
                key={room._id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex gap-4">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                    {room.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={room.image}
                        alt={room.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BedDouble className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{room.name}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {karaoke.name}
                        </p>
                      </div>
                      <Badge variant="outline">{room.type}</Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                        <Users className="h-4 w-4" />
                        {room.capacity} guests
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                        {room.price.toLocaleString()} MNT / hr
                      </span>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => startEdit(room)}
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDelete(room._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-3 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-5 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-100 dark:hover:bg-slate-900"
          >
            <Plus className="h-4 w-4" />
            Add new room
          </button>
        </>
      ) : (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {editing ? "Edit room" : "New room"}
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                {editing ? "Update room details" : "Add a room"}
              </h3>
            </div>
            <Button type="button" variant="outline" onClick={resetForm} className="rounded-2xl">
              Cancel
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClassName}>Room name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className={inputClassName}
                placeholder="VIP Gold"
              />
            </div>
            <div>
              <label className={labelClassName}>Room type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value as Room["type"],
                  }))
                }
                className={inputClassName}
              >
                <option value="VIP">VIP</option>
                <option value="Medium">Medium</option>
                <option value="Small">Small</option>
              </select>
            </div>
            <div>
              <label className={labelClassName}>Price per hour</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    price: formatNumberInput(e.target.value),
                  }))
                }
                className={inputClassName}
                placeholder="50000"
              />
            </div>
            <div>
              <label className={labelClassName}>Capacity</label>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, capacity: e.target.value }))
                }
                className={inputClassName}
                placeholder="10"
              />
            </div>
            <div className="md:col-span-2">
              <ImageUploadField
                label="Room image"
                value={form.image ? [form.image] : []}
                onChange={(images) =>
                  setForm((prev) => ({ ...prev, image: images[0] ?? "" }))
                }
                required
                helperText="Upload one image to represent this room."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              onClick={editing ? handleUpdate : handleAdd}
              disabled={loading}
              className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {loading ? "Saving..." : editing ? "Save changes" : "Create room"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
