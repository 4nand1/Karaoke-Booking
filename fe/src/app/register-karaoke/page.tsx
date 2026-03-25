"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import Iridescence from "@/components/Iridescence"
import { apiBaseUrl } from "@/lib/api-url"
import { clerkEnabled } from "@/lib/clerk-config"
import { api } from "@/lib/axios"
import { ImageUploadField } from "@/components/ui/image-upload-field"

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
  amenities: string
  images: string[]
  rulesPolicies: string
  latitude: string
  longitude: string
}

type FieldKey = keyof KaraokeForm

type ProfileResponse = {
  profile?: {
    role?: "customer" | "karaoke_owner"
    ownerStatus?: "pending" | "approved" | null
  } | null
  canRegisterKaraoke?: boolean
}

const STEPS = [
  {
    id: 0,
    title: "Basic info",
    description: "Karaoke name and owner contact",
    fields: ["karaokeName", "ownerFullName", "email", "phoneNumber"] as FieldKey[],
  },
  {
    id: 1,
    title: "Location",
    description: "City, address, and map coordinates",
    fields: ["city", "address", "latitude", "longitude"] as FieldKey[],
  },
  {
    id: 2,
    title: "Business details",
    description: "Description and opening hours",
    fields: ["description", "openingTime", "closingTime", "openingHours"] as FieldKey[],
  },
  {
    id: 3,
    title: "Extras",
    description: "Amenities, images, and policies",
    fields: ["amenities", "images", "rulesPolicies"] as FieldKey[],
  },
  {
    id: 4,
    title: "Review",
    description: "Confirm everything before submit",
    fields: [] as FieldKey[],
  },
]

const initialForm: KaraokeForm = {
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
  amenities: "",
  images: [],
  rulesPolicies: "",
  latitude: "",
  longitude: "",
}
export default function RegisterKaraokePage() {
  const router = useRouter()
  const { getToken, isLoaded } = useAuth()
  const { isSignedIn, user } = useUser()

  const [form, setForm] = useState<KaraokeForm>(initialForm)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [canAccess, setCanAccess] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ownerFullName: prev.ownerFullName || user?.fullName || "",
      email: prev.email || user?.primaryEmailAddress?.emailAddress || "",
    }))
  }, [user])

  useEffect(() => {
    if (form.openingTime && form.closingTime) {
      const autoText = `${form.openingTime} - ${form.closingTime}`
      setForm((prev) => {
        if (!prev.openingHours || prev.openingHours === autoText) {
          return { ...prev, openingHours: autoText }
        }
        return prev
      })
    }
  }, [form.openingTime, form.closingTime])

  useEffect(() => {
    if (!clerkEnabled) {
      setCheckingAccess(false)
      return
    }

    if (!isLoaded) return

    const checkAccess = async () => {
      try {
        if (!isSignedIn) {
          router.replace("/sign-in?role=admin&redirect_url=/register-karaoke")
          return
        }

        const token = await getToken()

        if (!token) {
          router.replace("/sign-in?role=admin&redirect_url=/register-karaoke")
          return
        }

        const res = await api.get<ProfileResponse>("/me/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const allowed =
          res.data?.canRegisterKaraoke === true ||
          res.data?.profile?.role === "karaoke_owner"

        setCanAccess(allowed)

        if (!allowed) {
          setError("Access denied. Only admin accounts can register karaokes.")
        }
      } catch {
        setError("Failed to verify access.")
        setCanAccess(false)
      } finally {
        setCheckingAccess(false)
      }
    }

    checkAccess()
  }, [getToken, isLoaded, isSignedIn, router])

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step])

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    const key = name as FieldKey

    setForm((prev) => ({ ...prev, [key]: value }))

    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }

    if (error) setError("")
  }

  function validateStep(currentStep: number) {
    const errors: Partial<Record<FieldKey, string>> = {}

    if (currentStep === 0) {
      if (!form.karaokeName.trim()) errors.karaokeName = "Karaoke name is required"
      if (!form.ownerFullName.trim()) errors.ownerFullName = "Owner full name is required"
      if (!form.email.trim()) {
        errors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = "Enter a valid email"
      }

      if (!form.phoneNumber.trim()) {
        errors.phoneNumber = "Phone number is required"
      } else if (!/^[0-9+\s()-]{6,20}$/.test(form.phoneNumber.trim())) {
        errors.phoneNumber = "Enter a valid phone number"
      }
    }

    if (currentStep === 1) {
      if (!form.city.trim()) errors.city = "City is required"
      if (!form.address.trim()) errors.address = "Address is required"

      if (form.latitude.trim()) {
        const lat = Number(form.latitude)
        if (Number.isNaN(lat) || lat < -90 || lat > 90) {
          errors.latitude = "Latitude must be between -90 and 90"
        }
      }

      if (form.longitude.trim()) {
        const lng = Number(form.longitude)
        if (Number.isNaN(lng) || lng < -180 || lng > 180) {
          errors.longitude = "Longitude must be between -180 and 180"
        }
      }
    }

    if (currentStep === 2) {
      if (!form.description.trim()) errors.description = "Description is required"
      if (!form.openingTime) errors.openingTime = "Opening time is required"
      if (!form.closingTime) errors.closingTime = "Closing time is required"

      if (form.openingTime && form.closingTime && form.openingTime === form.closingTime) {
        errors.closingTime = "Closing time must be different from opening time"
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function nextStep() {
    if (!validateStep(step)) return
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 0))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!canAccess) {
      setError("Access denied. Only admin accounts can register karaokes.")
      return
    }

    const valid =
      validateStep(0) &&
      validateStep(1) &&
      validateStep(2)

    if (!valid) {
      setStep(0)
      return
    }

    setLoading(true)

    try {
      if (!isSignedIn) {
        router.push("/sign-in?role=admin&redirect_url=/register-karaoke")
        return
      }

      const token = await getToken()

      if (!token) {
        router.push("/sign-in?role=admin&redirect_url=/register-karaoke")
        return
      }

      const payload = {
        karaokeName: form.karaokeName.trim(),
        ownerFullName: form.ownerFullName.trim() || user?.fullName || "",
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim() || user?.primaryEmailAddress?.emailAddress || "",
        address: form.address.trim(),
        city: form.city.trim(),
        description: form.description.trim(),
        openingHours: form.openingHours.trim(),
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        amenities: form.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        images: form.images,
        rulesPolicies: form.rulesPolicies.trim(),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      }

      const res = await fetch(`${apiBaseUrl}/onboarding/karaoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const contentType = res.headers.get("content-type") || ""
      const data =
        contentType.includes("application/json")
          ? await res.json()
          : await res.text()

      if (!res.ok) {
        const backendMessage =
          typeof data === "string"
            ? data
            : `${data.message || "Request failed"}${data.error ? `: ${data.error}` : ""}`

        throw new Error(backendMessage)
      }

      const karaokeId =
        typeof data === "string" ? undefined : data.karaoke?._id

      if (!karaokeId) {
        throw new Error("Karaoke created but karaoke ID was not returned")
      }

      router.push(`/admin/karaoke/${encodeURIComponent(karaokeId)}/rooms`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const labelStyle =
    "mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1"
  const inputStyle =
    "w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-white/30 backdrop-blur-md"
  const errorTextStyle = "mt-2 ml-1 text-xs text-red-400"

  function renderInputError(name: FieldKey) {
    if (!fieldErrors[name]) return null
    return <p className={errorTextStyle}>{fieldErrors[name]}</p>
  }

  function ReviewItem({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          {label}
        </p>
        <p className="text-sm text-white/90">{value || "—"}</p>
      </div>
    )
  }

  if (!clerkEnabled) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        Authentication is not configured for this environment yet.
      </main>
    )
  }

  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        Checking access...
      </main>
    )
  }

  if (!canAccess) {
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

        <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-black/40 p-8 text-center shadow-2xl backdrop-blur-2xl">
            <h1 className="text-3xl font-black text-white">Access denied</h1>
            <p className="mt-3 text-sm text-white/70">
              Only admin accounts can register a karaoke.
            </p>
            {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white"
              >
                Go to home
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/dashboard")}
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 font-bold text-white"
              >
                Go to admin dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

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
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl"
        >
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-400">
              <Star size={12} fill="currentColor" /> Register your karaoke
            </div>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              Multi-step <span className="text-purple-500">Registration</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/60">
              Complete the registration in a few short steps instead of filling one long form.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[2.5rem] border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-2xl md:p-10"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">
                    Step {step + 1} of {STEPS.length}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    {STEPS[step].title}
                  </h2>
                  <p className="mt-1 text-sm text-white/60">
                    {STEPS[step].description}
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  {STEPS.map((item, index) => {
                    const done = index < step
                    const active = index === step

                    return (
                      <div
                        key={item.id}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-black transition-all ${
                          done
                            ? "border-green-400/30 bg-green-400/15 text-green-300"
                            : active
                              ? "border-purple-400/40 bg-purple-500/20 text-white"
                              : "border-white/10 bg-white/5 text-white/40"
                        }`}
                      >
                        {done ? <CheckCircle2 size={16} /> : index + 1}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.25 }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                {step === 0 && (
                  <>
                    <div className="md:col-span-2">
                      <label className={labelStyle}>Караоке нэр</label>
                      <input
                        name="karaokeName"
                        value={form.karaokeName}
                        onChange={handleChange}
                        placeholder="Neon Dreams Karaoke"
                        className={inputStyle}
                      />
                      {renderInputError("karaokeName")}
                    </div>

                    <div>
                      <label className={labelStyle}>Эзэмшигчийн бүтэн нэр</label>
                      <input
                        name="ownerFullName"
                        value={form.ownerFullName}
                        onChange={handleChange}
                        placeholder="Owner full name"
                        className={inputStyle}
                      />
                      {renderInputError("ownerFullName")}
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
                      />
                      {renderInputError("email")}
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelStyle}>Утасны дугаар</label>
                      <input
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        placeholder="9911...."
                        className={inputStyle}
                      />
                      {renderInputError("phoneNumber")}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div>
                      <label className={labelStyle}>Хот</label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Ulaanbaatar"
                        className={inputStyle}
                      />
                      {renderInputError("city")}
                    </div>

                    <div>
                      <label className={labelStyle}>Хаяг</label>
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="District, street, building"
                        className={inputStyle}
                      />
                      {renderInputError("address")}
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
                      {renderInputError("latitude")}
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
                      {renderInputError("longitude")}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="md:col-span-2">
                      <label className={labelStyle}>Тайлбар</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="About your karaoke..."
                        className={`${inputStyle} min-h-[120px] resize-none`}
                      />
                      {renderInputError("description")}
                    </div>

                    <div>
                      <label className={labelStyle}>Нээлтийн цаг</label>
                      <input
                        name="openingTime"
                        type="time"
                        value={form.openingTime}
                        onChange={handleChange}
                        className={inputStyle}
                      />
                      {renderInputError("openingTime")}
                    </div>

                    <div>
                      <label className={labelStyle}>Хаалтын цаг</label>
                      <input
                        name="closingTime"
                        type="time"
                        value={form.closingTime}
                        onChange={handleChange}
                        className={inputStyle}
                      />
                      {renderInputError("closingTime")}
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
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="md:col-span-2">
                      <label className={labelStyle}>Amenities</label>
                      <input
                        name="amenities"
                        value={form.amenities}
                        onChange={handleChange}
                        placeholder="Wi-Fi, parking, food, private rooms"
                        className={inputStyle}
                      />
                      <p className="mt-2 ml-1 text-xs text-white/45">
                        Separate each item with a comma.
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <ImageUploadField
                        label="Images"
                        value={form.images}
                        onChange={(images) => {
                          setForm((prev) => ({ ...prev, images }))
                          if (fieldErrors.images) {
                            setFieldErrors((prev) => {
                              const next = { ...prev }
                              delete next.images
                              return next
                            })
                          }
                        }}
                        multiple
                        theme="dark"
                        helperText="Choose karaoke photos from your device instead of pasting URLs."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelStyle}>Rules / Policies</label>
                      <textarea
                        name="rulesPolicies"
                        value={form.rulesPolicies}
                        onChange={handleChange}
                        placeholder="No smoking, valid ID required, deposit policy..."
                        className={`${inputStyle} min-h-[120px] resize-none`}
                      />
                    </div>
                  </>
                )}

                {step === 4 && (
                  <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ReviewItem label="Karaoke name" value={form.karaokeName} />
                    <ReviewItem label="Owner" value={form.ownerFullName} />
                    <ReviewItem label="Email" value={form.email} />
                    <ReviewItem label="Phone" value={form.phoneNumber} />
                    <ReviewItem label="City" value={form.city} />
                    <ReviewItem label="Address" value={form.address} />
                    <ReviewItem label="Description" value={form.description} />
                    <ReviewItem label="Opening hours" value={form.openingHours} />
                    <ReviewItem label="Amenities" value={form.amenities} />
                    <ReviewItem
                      label="Images"
                      value={form.images.length > 0 ? form.images.join(", ") : ""}
                    />
                    <ReviewItem label="Rules / Policies" value={form.rulesPolicies} />
                    <ReviewItem
                      label="Coordinates"
                      value={
                        form.latitude || form.longitude
                          ? `${form.latitude || "—"}, ${form.longitude || "—"}`
                          : "—"
                      }
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {error ? (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-center text-xs text-red-400">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0 || loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-black uppercase tracking-widest text-white shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-black uppercase tracking-widest text-white shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Бүртгэж байна..." : "Дараах → Өрөө бүртгэх"}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
