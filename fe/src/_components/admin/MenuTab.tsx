"use client"

import { useState } from "react"
import { Edit3, Plus, Trash2, Utensils } from "lucide-react"
import { toast } from "sonner"

import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api, apiError } from "@/lib/axios"
import { useLanguage } from "@/lib/language"
import { formatMNT } from "@/lib/venue"
import { cn } from "@/lib/utils"
import type { RegisteredKaraoke } from "./AdminRegister"

type Item = NonNullable<RegisteredKaraoke["menu"]>[number]
type Form = { name: string; category: Item["category"]; price: string; description: string; image: string }

const emptyForm: Form = { name: "", category: "food", price: "", description: "", image: "" }
const CATEGORIES: { key: Item["category"]; label: [string, string] }[] = [
  { key: "food", label: ["Food", "Хоол"] },
  { key: "drink", label: ["Drink", "Ундаа"] },
  { key: "set", label: ["Set", "Сет"] },
]
const digits = (value: string) => value.replace(/\D/g, "")

export function MenuTab({ karaoke, onRefresh }: { karaoke: { _id: string; menu?: Item[] }; onRefresh: () => void }) {
  const { t } = useLanguage()
  const items = karaoke.menu ?? []
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [saving, setSaving] = useState(false)
  const base = `/karaoke/${karaoke._id}/menu`

  const reset = () => {
    setOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  async function save() {
    if (!form.name.trim() || !form.price) {
      toast.error(t("Fill in name and price", "Нэр, үнээ бөглөнө үү"))
      return
    }
    setSaving(true)
    const item = { ...form, name: form.name.trim(), price: Number(digits(form.price)) }
    try {
      if (editing) await api.put(`${base}/${editing}`, item)
      else await api.post(base, item)
      reset()
      onRefresh()
    } catch (e) {
      toast.error(apiError(e, t("Couldn't save the item", "Хадгалж чадсангүй")))
    } finally {
      setSaving(false)
    }
  }

  async function patch(item: Item, update: Partial<Item>) {
    try {
      await api.put(`${base}/${item._id}`, update)
      onRefresh()
    } catch (e) {
      toast.error(apiError(e, t("Couldn't update", "Шинэчилж чадсангүй")))
    }
  }

  async function remove(item: Item) {
    if (!window.confirm(t(`Delete ${item.name}?`, `${item.name}-г устгах уу?`))) return
    try {
      await api.delete(`${base}/${item._id}`)
      onRefresh()
    } catch (e) {
      toast.error(apiError(e, t("Couldn't delete", "Устгаж чадсангүй")))
    }
  }

  if (open) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-lg font-semibold">{editing ? t("Edit item", "Засах") : t("Add item", "Нэмэх")}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="item-name">{t("Name", "Нэр")}</Label>
            <Input id="item-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-price">{t("Price (₮)", "Үнэ (₮)")}</Label>
            <Input
              id="item-price"
              inputMode="numeric"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: digits(e.target.value) ? Number(digits(e.target.value)).toLocaleString("en-US") : "" })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{t("Category", "Ангилал")}</Label>
            <div className="flex gap-2">
              {CATEGORIES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={form.category === key}
                  onClick={() => setForm({ ...form, category: key })}
                  className={cn(
                    "h-11 flex-1 rounded-xl border text-sm font-medium",
                    form.category === key ? "border-primary bg-primary/15 text-primary" : "border-border bg-card"
                  )}
                >
                  {t(...label)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="item-desc">{t("Description", "Тайлбар")}</Label>
            <Textarea id="item-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField label={t("Photo (optional)", "Зураг (заавал биш)")} value={form.image ? [form.image] : []} onChange={(images) => setForm({ ...form, image: images[0] ?? "" })} />
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
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item._id} className={cn("flex items-center gap-3 rounded-xl border border-border bg-card p-3", !item.isAvailable && "opacity-60")}>
            {item.image ? (
              <img src={item.image} alt="" className="size-14 rounded-lg object-cover" loading="lazy" />
            ) : (
              <span className="flex size-14 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Utensils className="size-5" /></span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.name}</p>
              <p className="text-sm tabular-nums text-muted-foreground">{formatMNT(item.price)}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => patch(item, { isAvailable: !item.isAvailable })}>
              {item.isAvailable ? t("Visible", "Харагдана") : t("Hidden", "Нуугдсан")}
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={t("Edit", "Засах")}
              onClick={() => {
                setEditing(item._id)
                setForm({ name: item.name, category: item.category, price: item.price.toLocaleString("en-US"), description: item.description ?? "", image: item.image ?? "" })
                setOpen(true)
              }}
            >
              <Edit3 />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label={t("Delete", "Устгах")} onClick={() => void remove(item)}>
              <Trash2 className="text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted px-6 py-5 text-sm font-semibold transition-colors hover:border-primary/50"
      >
        <Plus className="size-4" /> {t("Add item", "Нэмэх")}
      </button>
    </div>
  )
}
