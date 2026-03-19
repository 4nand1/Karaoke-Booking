"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import Iridescence from "@/components/Iridescence"

type KaraokeForm = {
  karaokeName: string
  ownerFullName: string
  phoneNumber: string
  email: string
  address: string
  city: string
  description: string
  openingHours: string
  openingTime: string
  closingTime: string
  roomTypes: string
  pricePerHour: string
  capacity: string
  amenities: string
  images: string
  rulesPolicies: string
  latitude: string
  longitude: string
}

export default function RegisterKaraokePage() {
  const router = useRouter()
  const { getToken } = useAuth()
  const { isSignedIn, user } = useUser()

  const [form, setForm] = useState<KaraokeForm>({
    karaokeName: "",
    ownerFullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    description: "",
    openingHours: "",
    openingTime: "",
    closingTime: "",
    roomTypes: "",
    pricePerHour: "",
    capacity: "",
    amenities: "",
    images: "",
    rulesPolicies: "",
    latitude: "",
    longitude: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!isSignedIn) {
        router.push("/sign-in?redirect_url=/register-karaoke")
        return
      }

      const token = await getToken()

      if (!token) {
        router.push("/sign-in?redirect_url=/register-karaoke")
        return
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/onboarding/karaoke`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            karaokeName: form.karaokeName,
            ownerFullName: form.ownerFullName || user?.fullName || "",
            phoneNumber: form.phoneNumber,
            email:
              form.email ||
              user?.primaryEmailAddress?.emailAddress ||
              "",
            address: form.address,
            city: form.city,
            description: form.description,
            openingHours: form.openingHours,
            openingTime: form.openingTime,
            closingTime: form.closingTime,
            roomTypes: form.roomTypes
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : null,
            capacity: form.capacity ? Number(form.capacity) : null,
            amenities: form.amenities
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            images: form.images
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            rulesPolicies: form.rulesPolicies,
            latitude: form.latitude ? Number(form.latitude) : null,
            longitude: form.longitude ? Number(form.longitude) : null,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Бүртгэл амжилтгүй боллоо")
      }

      setSuccess("Караоке бүртгэл амжилттай илгээгдлээ. Баталгаажуулалт хүлээгдэж байна.")
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const labelStyle =
    "mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1"
  const inputStyle =
    "w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-white/10 backdrop-blur-md"

  return (
    <main className="relative min-h-screen w-full bg-[#0a0118]">
      <div className="fixed inset-0 z-0">
        <Iridescence
          color={[0.5, 0.6, 0.8]}
          mouseReact
          amplitude={0.1}
          speed={1}
        />
      </div>

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl"
        >
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-400">
              <Star size={12} fill="currentColor" /> Your Karaoke, Your Rules
            </div>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              Register <span className="text-purple-500">Karaoke</span>
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[2.5rem] border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-2xl md:p-10"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelStyle}>Караоке нэр</label>
                <input
                  name="karaokeName"
                  value={form.karaokeName}
                  onChange={handleChange}
                  placeholder="Neon Dreams Karaoke"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Эзэмшигчийн бүтэн нэр</label>
                <input
                  name="ownerFullName"
                  value={form.ownerFullName}
                  onChange={handleChange}
                  placeholder="Owner full name"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Имэйл</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="owner@example.com"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Утасны дугаар</label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="9911...."
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Хот</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Ulaanbaatar"
                  className={inputStyle}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>Хаяг</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="District, street, building"
                  className={inputStyle}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>Тайлбар</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="About your karaoke..."
                  className={`${inputStyle} min-h-[100px] resize-none`}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Нээлтийн цаг</label>
                <input
                  name="openingTime"
                  type="time"
                  value={form.openingTime}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Хаалтын цаг</label>
                <input
                  name="closingTime"
                  type="time"
                  value={form.closingTime}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>Opening hours text</label>
                <input
                  name="openingHours"
                  value={form.openingHours}
                  onChange={handleChange}
                  placeholder="10:00 - 02:00"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Room types</label>
                <input
                  name="roomTypes"
                  value={form.roomTypes}
                  onChange={handleChange}
                  placeholder="Small room, VIP room"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Price per hour</label>
                <input
                  name="pricePerHour"
                  type="number"
                  min="0"
                  value={form.pricePerHour}
                  onChange={handleChange}
                  placeholder="50000"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Capacity</label>
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="10"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Amenities</label>
                <input
                  name="amenities"
                  value={form.amenities}
                  onChange={handleChange}
                  placeholder="Wi-Fi, parking, food, private rooms"
                  className={inputStyle}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>Images</label>
                <input
                  name="images"
                  value={form.images}
                  onChange={handleChange}
                  placeholder="https://..., https://..."
                  className={inputStyle}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>Rules / Policies</label>
                <textarea
                  name="rulesPolicies"
                  value={form.rulesPolicies}
                  onChange={handleChange}
                  placeholder="No smoking, valid ID required, deposit policy..."
                  className={`${inputStyle} min-h-[100px] resize-none`}
                />
              </div>

              <div>
                <label className={labelStyle}>Байрлалын өргөрөг</label>
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="47.9077"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Байрлалын уртраг</label>
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="106.8832"
                  className={inputStyle}
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-center text-xs text-red-400">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-3 text-center text-xs text-emerald-400">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 font-black uppercase tracking-widest text-white shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Бүртгэж байна..." : "Бүртгэх →"}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}