"use client"

import { useState, type ChangeEvent, type FormEvent, useEffect } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import Iridescence from '@/components/Iridescence'

type KaraokeForm = {
  karaokeName: string
  address: string
  city: string
  phone: string
  description: string
  openingTime: string
  closingTime: string
  latitude: string
  longitude: string
}

export default function RegisterKaraokePage() {
  const router = useRouter()
  const { getToken } = useAuth()
  const { isSignedIn, user } = useUser()

  const [form, setForm] = useState<KaraokeForm>({
    karaokeName: "", address: "", city: "", phone: "",
    description: "", openingTime: "", closingTime: "",
    latitude: "", longitude: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!isSignedIn) { router.push("/sign-in"); return }
      const token = await getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/karaoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          ownerClerkUserId: user?.id,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        }),
      })

      if (!res.ok) throw new Error("Бүртгэл амжилтгүй боллоо")
      router.push(`/admin`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally { setLoading(false) }
  }

  useEffect(() => {
  if (!user) return
  
  async function checkExisting() {
    const token = await getToken()
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/karaoke/mine?ownerClerkUserId=${user?.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (res.ok) {
      router.push("/admin")
    }
  }
  
  checkExisting()
}, [user])

  const labelStyle = "mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1"
  const inputStyle = "w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-white/10 backdrop-blur-md"

  return (
    <main className="relative min-h-screen w-full bg-[#0a0118]">
     <div className="fixed inset-0 z-0 bg-[#0a0118]">
  <Iridescence color={[0.5, 0.6, 0.8]} mouseReact amplitude={0.1} speed={1} />
</div>

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400 mb-4">
              <Star size={12} fill="currentColor" /> Your Karaoke, Your Rules
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Register <span className="text-purple-500">Karaoke</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-black/40 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="md:col-span-2">
                <label className={labelStyle}>Караоке нэр</label>
                <input name="karaokeName" value={form.karaokeName} onChange={handleChange} placeholder="Neon Dreams Karaoke" className={inputStyle} required />
              </div>

              <div>
                <label className={labelStyle}>Хаяг байрлал</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="District, Street" className={inputStyle} required />
              </div>

              <div>
                <label className={labelStyle}>Хот</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="Ulaanbaatar" className={inputStyle} required />
              </div>

              <div>
                <label className={labelStyle}>Утасны дугаар</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="9911..." className={inputStyle} required />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>Тайлбар</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="About your place..." className={`${inputStyle} min-h-[100px] resize-none`} required />
              </div>

              <div>
                <label className={labelStyle}>Нээлтийн цаг</label>
                <input name="openingTime" type="time" value={form.openingTime} onChange={handleChange} className={inputStyle} required />
              </div>

              <div>
                <label className={labelStyle}>Хаалтын цаг</label>
                <input name="closingTime" type="time" value={form.closingTime} onChange={handleChange} className={inputStyle} required />
              </div>

              <div>
                <label className={labelStyle}>Байрлалын өргөрөг</label>
                <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} placeholder="47.9077" className={inputStyle} />
              </div>

              <div>
                <label className={labelStyle}>Байрлалын уртраг</label>
                <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} placeholder="106.8832" className={inputStyle} />
              </div>

            </div>

            {error && (
              <p className="text-center text-xs text-red-400 bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Бүртгэж байна..." : "Бүртгэх →"}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}