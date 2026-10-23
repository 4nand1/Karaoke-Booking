"use client"

import { useState } from "react"
import { BedDouble, Edit3, Plus, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, apiError } from "@/lib/axios"
import { useLanguage } from "@/lib/language"
import { formatMNT } from "@/lib/venue"
import { cn } from "@/lib/utils"
import type { RegisteredKaraoke } from "./AdminRegister"

type Room = NonNullable<RegisteredKaraoke["rooms"]>[number]
type Form = { name: string; type: Room["type"]; price: string; capacity: string; image: string }

const emptyForm: Form = { name: "", type: "Small", price: "", capacity: "", image: "" }
const TYPES: Room["type"][] = ["Small", "Medium", "VIP"]
const digits = (value: string) => value.replace(/\D/g, "")

export function RoomsTab({ karaoke, onRefresh }: { karaoke: { _id: string; rooms?: Room[] }; onRefresh: () => void }) {
  const { t } = useLanguage()
  const rooms = karaoke.rooms ?? []
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [saving, setSaving] = useState(false)
  const base = `/karaoke/${karaoke._id}/rooms`

  const reset = () => {
    setOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  async function save() {
    if (!form.name.trim() || !form.price || !form.capacity || !form.image) {
      toast.error(t("Fill in name, price, capacity and a photo", "Нэр, үнэ, багтаамж, зургаа бөглөнө үү"))
      return
    }
    setSaving(true)
    const room = { ...form, name: form.name.trim(), price: Number(digits(form.price)), capacity: Number(form.capacity) }
    try {
      if (editing) await api.put(`${base}/${editing}`, room)
      else await api.post(base, { rooms: [room] })
      reset()
      onRefresh()
    } catch (e) {
      toast.error(apiError(e, t("Couldn't save the room", "Өрөө хадгалж чадсангүй")))
    } finally {
      setSaving(false)
    }
  }

  async function patch(room: Room, update: Partial<Room>) {
    try {
      await api.put(`${base}/${room._id}`, update)
      onRefresh()
    } catch (e) {
      toast.error(apiError(e, t("Couldn't update", "Шинэчилж чадсангүй")))
    }
  }

  async function remove(room: Room) {
    if (!window.confirm(t(`Delete ${room.name}?`, `${room.name}-г устгах уу?`))) return
    try {
      await api.delete(`${base}/${room._id}`)
      onRefresh()
    } catch (e) {
      toast.error(apiError(e, t("Couldn't delete", "Устгаж чадсангүй")))
    }
  }

  if (open) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-lg font-semibold">{editing ? t("Edit room", "Өрөө засах") : t("Add room", "Өрөө нэмэх")}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="room-name">{t("Room name", "Өрөөний нэр")}</Label>
            <Input id="room-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("Type", "Төрөл")}</Label>
            <div className="flex gap-2">
              {TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={form.type === type}
                  onClick={() => setForm({ ...form, type })}
                  className={cn(
                    "h-11 flex-1 rounded-xl border text-sm font-medium",
                    form.type === type ? "border-primary bg-primary/15 text-primary" : "border-border bg-card"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-price">{t("Price per hour (₮)", "Цагийн үнэ (₮)")}</Label>
            <Input
              id="room-price"
              inputMode="numeric"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: digits(e.target.value) ? Number(digits(e.target.value)).toLocaleString("en-US") : "" })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-capacity">{t("Capacity", "Багтаамж")}</Label>
            <Input id="room-capacity" type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField label={t("Photo", "Зураг")} value={form.image ? [form.image] : []} onChange={(images) => setForm({ ...form, image: images[0] ?? "" })} />
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button disabled={saving} onClick={() => void save()}>{t("Save", "Хадгалах")}</Button>
          <Button variant="ghost" onClick={reset}>{t("Cancel", "Болих")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        {rooms.map((room) => (
          <div key={room._id} className={cn("flex gap-4 rounded-2xl border border-border bg-card p-4", !room.isAvailable && "opacity-60")}>
            {room.image ? (
              <img src={room.image} alt="" className="size-24 shrink-0 rounded-xl object-cover" loading="lazy" />
            ) : (
              <span className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-muted"><BedDouble className="size-5 text-muted-foreground" /></span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-lg font-semibold">{room.name}</p>
                <Badge variant="outline">{room.type}</Badge>
              </div>
              <p className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="size-4" />{room.capacity}</span>
                <span className="tabular-nums">{formatMNT(room.price)}{t(" / hr", " / цаг")}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => patch(room, { isAvailable: !room.isAvailable })}>
                  {room.isAvailable ? t("Visible", "Харагдана") : t("Hidden", "Нуугдсан")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(room._id)
                    setForm({ name: room.name, type: room.type, price: room.price.toLocaleString("en-US"), capacity: String(room.capacity), image: room.image })
                    setOpen(true)
                  }}
                >
                  <Edit3 /> {t("Edit", "Засах")}
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label={t("Delete", "Устгах")} onClick={() => void remove(room)}>
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted px-6 py-5 text-sm font-semibold transition-colors hover:border-primary/50"
      >
        <Plus className="size-4" /> {t("Add room", "Өрөө нэмэх")}
      </button>
    </div>
  )
}
