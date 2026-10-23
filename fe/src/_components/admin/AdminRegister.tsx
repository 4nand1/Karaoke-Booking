"use client"

import { useState, type ReactNode } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, LocateFixed } from "lucide-react"

import LocationPicker from "./LocationPickerClient"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { api, apiError } from "@/lib/axios"
import { useLanguage } from "@/lib/language"

export type RegisteredKaraoke = {
  _id: string
  ownerClerkUserId?: string
  name: string
  address: string
  city: string
  phone: string
  email?: string
  ownerFullName?: string
  description: string
  openingTime: string
  closingTime: string
  amenities?: string[]
  images?: string[]
  rulesPolicies?: string
  latitude?: number | null
  longitude?: number | null
  approvalStatus?: "pending" | "approved" | "rejected" | "draft"
  rooms?: Array<{
    _id: string
    name: string
    type: "VIP" | "Medium" | "Small"
    price: number
    capacity: number
    image: string
    isAvailable: boolean
  }>
  menu?: Array<{
    _id: string
    name: string
    category: "food" | "drink" | "set"
    price: number
    description?: string
    image?: string
    isAvailable: boolean
  }>
}

type Form = {
  karaokeName: string
  ownerFullName: string
  phoneNumber: string
  email: string
  address: string
  city: string
  latitude: string
  longitude: string
  openingTime: string
  closingTime: string
  description: string
  amenities: string
  images: string[]
  rulesPolicies: string
}

const emptyForm: Form = {
  karaokeName: "", ownerFullName: "", phoneNumber: "", email: "", address: "", city: "",
  latitude: "", longitude: "", openingTime: "", closingTime: "", description: "",
  amenities: "", images: [], rulesPolicies: "",
}

const toForm = (k: RegisteredKaraoke): Form => ({
  karaokeName: k.name,
  ownerFullName: k.ownerFullName ?? "",
  phoneNumber: k.phone,
  email: k.email ?? "",
  address: k.address,
  city: k.city,
  latitude: k.latitude != null ? String(k.latitude) : "",
  longitude: k.longitude != null ? String(k.longitude) : "",
  openingTime: k.openingTime,
  closingTime: k.closingTime,
  description: k.description,
  amenities: (k.amenities ?? []).join(", "),
  images: k.images ?? [],
  rulesPolicies: k.rulesPolicies ?? "",
})

type Props = {
  currentKaraoke?: RegisteredKaraoke | null
  onRegistered?: (karaoke: RegisteredKaraoke) => void
}

export default function KaraokeRegisterForm({ currentKaraoke = null, onRegistered }: Props) {
  const { t } = useLanguage()
  const { user } = useUser()
  const editing = !!currentKaraoke?._id

  const [form, setForm] = useState<Form>(() => (currentKaraoke ? toForm(currentKaraoke) : emptyForm))
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const required: (keyof Form)[][] = [
    ["karaokeName", "ownerFullName", "phoneNumber", "email"],
    ["address", "city", "openingTime", "closingTime"],
    ["description"],
  ]

  function validate(groups: (keyof Form)[][]) {
    const next: typeof errors = {}
    for (const key of groups.flat()) {
      if (!String(form[key]).trim()) next[key] = t("Required", "Заавал бөглөнө")
    }
    setErrors(next)
    return !Object.keys(next).length
  }

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        set("latitude", pos.coords.latitude.toFixed(6))
        set("longitude", pos.coords.longitude.toFixed(6))
      },
      () => toast.error(t("Couldn't get your location", "Байршил тодорхойлж чадсангүй"))
    )
  }

  async function save() {
    if (!validate(editing ? required : [required.flat()])) return
    setSaving(true)
    try {
      const payload = {
        ownerFullName: form.ownerFullName.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        description: form.description.trim(),
        amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
        images: form.images,
        rulesPolicies: form.rulesPolicies.trim(),
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
      }
      const { data } = editing
        ? await api.put(`/karaoke/${currentKaraoke!._id}`, { ...payload, name: form.karaokeName.trim(), phone: form.phoneNumber.trim() })
        : await api.post("/onboarding/karaoke", { ...payload, karaokeName: form.karaokeName.trim(), phoneNumber: form.phoneNumber.trim() })

      await user?.reload()
      toast.success(editing ? t("Saved", "Хадгалагдлаа") : t("Submitted for review", "Хянуулахаар илгээлээ"))
      if (data?.karaoke) onRegistered?.(data.karaoke as RegisteredKaraoke)
      if (!editing) {
        setForm(emptyForm)
        setStep(0)
      }
    } catch (e) {
      toast.error(apiError(e, t("Couldn't save", "Хадгалж чадсангүй")))
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof Form, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} value={form[key] as string} aria-invalid={!!errors[key]} onChange={(e) => set(key, e.target.value as never)} {...props} />
      {errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}
    </div>
  )

  const sections: { title: string; body: ReactNode }[] = [
    {
      title: t("Business", "Бизнес"),
      body: (
        <div className="grid gap-4 sm:grid-cols-2">
          {field("karaokeName", t("Venue name", "Караокегийн нэр"))}
          {field("ownerFullName", t("Owner name", "Эзэмшигчийн нэр"))}
          {field("phoneNumber", t("Phone", "Утас"), { type: "tel", inputMode: "tel" })}
          {field("email", t("Email", "И-мэйл"), { type: "email" })}
        </div>
      ),
    },
    {
      title: t("Location & hours", "Байршил ба цаг"),
      body: (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("address", t("Address", "Хаяг"))}
            {field("city", t("City", "Хот"))}
            {field("openingTime", t("Opens", "Нээх цаг"), { type: "time" })}
            {field("closingTime", t("Closes", "Хаах цаг"), { type: "time" })}
            {field("latitude", t("Latitude", "Өргөрөг"), { inputMode: "decimal" })}
            {field("longitude", t("Longitude", "Уртраг"), { inputMode: "decimal" })}
          </div>
          <LocationPicker
            latitude={form.latitude === "" || Number.isNaN(Number(form.latitude)) ? null : Number(form.latitude)}
            longitude={form.longitude === "" || Number.isNaN(Number(form.longitude)) ? null : Number(form.longitude)}
            onPick={(lat, lng) => {
              set("latitude", lat.toFixed(6))
              set("longitude", lng.toFixed(6))
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
              <LocateFixed /> {t("Use my current location", "Одоогийн байршлаа ашиглах")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("Click the map to place your venue. Needed to appear on the map.", "Газрын зураг дээр дарж байршлаа тэмдэглэнэ үү. Газрын зураг дээр харагдахад шаардлагатай.")}</p>
          </div>
        </div>
      ),
    },
    {
      title: t("Details", "Дэлгэрэнгүй"),
      body: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">{t("Description", "Тайлбар")}</Label>
            <Textarea id="description" rows={4} value={form.description} aria-invalid={!!errors.description} onChange={(e) => set("description", e.target.value)} />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          {field("amenities", t("Amenities (comma separated)", "Үйлчилгээ (таслалаар тусгаарла)"))}
          <div className="space-y-2">
            <Label htmlFor="rulesPolicies">{t("Rules & policies", "Дүрэм журам")}</Label>
            <Textarea id="rulesPolicies" rows={3} value={form.rulesPolicies} onChange={(e) => set("rulesPolicies", e.target.value)} />
          </div>
          <ImageUploadField label={t("Photos", "Зураг")} value={form.images} onChange={(images) => set("images", images)} multiple />
        </div>
      ),
    },
  ]

  const last = step === sections.length - 1

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card md:p-6">
      {editing ? (
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{s.title}</h3>
              {s.body}
            </section>
          ))}
          <Button disabled={saving} onClick={() => void save()}>{t("Save changes", "Хадгалах")}</Button>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t(`Step ${step + 1} of ${sections.length}`, `${step + 1}/${sections.length}-р алхам`)} · {sections[step].title}
          </p>
          <Progress value={((step + 1) / sections.length) * 100} className="mt-3 h-1.5" />
          <div className="mt-6">{sections[step].body}</div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ChevronLeft /> {t("Back", "Буцах")}
            </Button>
            {last ? (
              <Button disabled={saving} onClick={() => void save()}>{t("Submit for review", "Хянуулахаар илгээх")}</Button>
            ) : (
              <Button
                onClick={() => {
                  if (validate([required[step]])) setStep(step + 1)
                }}
              >
                {t("Next", "Дараах")} <ChevronRight />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
