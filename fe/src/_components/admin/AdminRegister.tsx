"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import { apiBaseUrl } from "@/lib/api-url"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type FormDataType = {
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
  images: string[]
  rulesPolicies: string
}

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
  openingHours?: string
  openingTime: string
  closingTime: string
  roomTypes?: string[]
  pricePerHour?: number | null
  capacity?: number | null
  amenities?: string[]
  images?: string[]
  rulesPolicies?: string
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

const initialForm: FormDataType = {
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
  images: [],
  rulesPolicies: "",
}

type KaraokeRegisterFormProps = {
  embedded?: boolean
  onRegistered?: (karaoke: RegisteredKaraoke) => void
}

type FormKey = keyof FormDataType

const STEPS: Array<{
  id: string
  title: string
  description: string
  fields: FormKey[]
}> = [
  {
    id: "business",
    title: "Business details",
    description: "Name, owner, and contact details.",
    fields: ["karaokeName", "ownerFullName", "email", "phoneNumber"],
  },
  {
    id: "location",
    title: "Location and hours",
    description: "Address, city, and operating hours.",
    fields: ["city", "address", "openingTime", "closingTime", "openingHours"],
  },
  {
    id: "experience",
    title: "Experience and policies",
    description: "Description, pricing hints, amenities, photos, and policies.",
    fields: [
      "description",
      "roomTypes",
      "pricePerHour",
      "capacity",
      "amenities",
      "images",
      "rulesPolicies",
    ],
  },
]

export default function KaraokeRegisterForm({
  embedded = false,
  onRegistered,
}: KaraokeRegisterFormProps) {
  const router = useRouter()
  const { getToken } = useAuth()
  const { isSignedIn, user } = useUser()

  const [formData, setFormData] = useState<FormDataType>(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ownerFullName: prev.ownerFullName || user?.fullName || "",
      email: prev.email || user?.primaryEmailAddress?.emailAddress || "",
    }))
  }, [user])

  useEffect(() => {
    if (!formData.openingTime || !formData.closingTime) return

    const suggestedValue = `${formData.openingTime} - ${formData.closingTime}`
    setFormData((prev) => {
      if (!prev.openingHours || prev.openingHours === suggestedValue) {
        return { ...prev, openingHours: suggestedValue }
      }

      return prev
    })
  }, [formData.openingTime, formData.closingTime])

  const progressValue = useMemo(
    () => ((currentStep + 1) / STEPS.length) * 100,
    [currentStep]
  )

  const inputClassName =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-200 dark:focus:ring-slate-200/10"
  const labelClassName =
    "mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function validateStep(stepIndex: number) {
    if (stepIndex === 0) {
      if (!formData.karaokeName.trim()) return "Karaoke name is required."
      if (!formData.ownerFullName.trim()) return "Owner full name is required."
      if (!formData.email.trim()) return "Email is required."
      if (!formData.phoneNumber.trim()) return "Phone number is required."
    }

    if (stepIndex === 1) {
      if (!formData.city.trim()) return "City is required."
      if (!formData.address.trim()) return "Address is required."
      if (!formData.openingTime) return "Opening time is required."
      if (!formData.closingTime) return "Closing time is required."
    }

    if (stepIndex === 2) {
      if (!formData.description.trim()) return "Description is required."
    }

    return ""
  }

  function goToNextStep() {
    const validationMessage = validateStep(currentStep)

    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setError("")
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  function goToPreviousStep() {
    setError("")
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validationMessage = validateStep(currentStep)
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setLoading(true)
    setMessage("")
    setError("")

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

      const res = await fetch(`${apiBaseUrl}/onboarding/karaoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          karaokeName: formData.karaokeName,
          ownerFullName: formData.ownerFullName || user?.fullName || "",
          phoneNumber: formData.phoneNumber,
          email: formData.email || user?.primaryEmailAddress?.emailAddress || "",
          address: formData.address,
          city: formData.city,
          description: formData.description,
          openingHours: formData.openingHours,
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          roomTypes: formData.roomTypes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          pricePerHour: formData.pricePerHour
            ? Number(formData.pricePerHour)
            : null,
          capacity: formData.capacity ? Number(formData.capacity) : null,
          amenities: formData.amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          images: formData.images,
          rulesPolicies: formData.rulesPolicies,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to register karaoke")
      }

      const karaoke = data?.karaoke as RegisteredKaraoke | undefined

      setMessage("Karaoke registration submitted successfully.")
      setFormData(initialForm)
      setCurrentStep(0)

      if (karaoke) {
        onRegistered?.(karaoke)
      }

      if (!embedded) {
        router.push("/admin/dashboard")
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const sectionShell = embedded
    ? "overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900"
    : "mx-auto mt-10 max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900"

  return (
    <div className={sectionShell}>
      <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="border-b border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950 lg:border-b-0 lg:border-r">
          <Badge variant="outline" className="mb-4">
            Step 1
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Register Karaoke
          </h2>

          <div className="mt-8 space-y-3">
            {STEPS.map((step, index) => {
              const active = index === currentStep
              const complete = index < currentStep

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border px-4 py-3 transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                      : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        active
                          ? "bg-white/15 text-current dark:bg-slate-900/10"
                          : complete
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {complete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p
                        className={`mt-1 text-xs leading-5 ${
                          active
                            ? "text-white/75 dark:text-slate-700"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {STEPS[currentStep].title}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {STEPS[currentStep].description}
                </p>
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {currentStep + 1}/{STEPS.length}
              </span>
            </div>
            <Progress value={progressValue} className="mt-4 h-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClassName}>Karaoke name</label>
                  <input
                    type="text"
                    name="karaokeName"
                    placeholder="Midnight Echo Karaoke"
                    value={formData.karaokeName}
                    onChange={handleChange}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className={labelClassName}>Owner full name</label>
                  <input
                    type="text"
                    name="ownerFullName"
                    placeholder="Owner full name"
                    value={formData.ownerFullName}
                    onChange={handleChange}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className={labelClassName}>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="owner@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClassName}>Phone number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={inputClassName}
                    required
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClassName}>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className={labelClassName}>Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className={labelClassName}>Opening time</label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleChange}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className={labelClassName}>Closing time</label>
                  <input
                    type="time"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleChange}
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClassName}>Opening hours text</label>
                  <input
                    type="text"
                    name="openingHours"
                    placeholder="16:00 - 03:00"
                    value={formData.openingHours}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClassName}>Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe the vibe, sound system, and customer experience."
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputClassName} min-h-32 resize-none`}
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <label className={labelClassName}>Room types</label>
                  <input
                    type="text"
                    name="roomTypes"
                    placeholder="VIP, Medium, Small"
                    value={formData.roomTypes}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Base price per hour</label>
                  <input
                    type="number"
                    name="pricePerHour"
                    placeholder="50000"
                    value={formData.pricePerHour}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    placeholder="10"
                    value={formData.capacity}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Amenities</label>
                  <input
                    type="text"
                    name="amenities"
                    placeholder="Parking, private rooms, food service"
                    value={formData.amenities}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Images"
                    value={formData.images}
                    onChange={(images) =>
                      setFormData((prev) => ({ ...prev, images }))
                    }
                    multiple
                    helperText="Select karaoke photos from your device."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClassName}>Rules and policies</label>
                  <textarea
                    name="rulesPolicies"
                    placeholder="Age policy, food rules, cancellation terms, deposit terms."
                    value={formData.rulesPolicies}
                    onChange={handleChange}
                    className={`${inputClassName} min-h-28 resize-none`}
                    rows={4}
                  />
                </div>
              </div>
            ) : null}

            {message ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                {message}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0 || loading}
                className="rounded-2xl"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  disabled={loading}
                  className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Next step
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  {loading ? "Saving..." : embedded ? "Save karaoke" : "Register karaoke"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
