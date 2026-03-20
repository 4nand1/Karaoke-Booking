"use client"

import { useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { apiBaseUrl } from "@/lib/api-url"

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
  images: string
  rulesPolicies: string
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
  images: "",
  rulesPolicies: "",
}

export default function KaraokeRegisterForm() {
  const router = useRouter()
  const { getToken } = useAuth()
  const { isSignedIn, user } = useUser()

  const [formData, setFormData] = useState<FormDataType>(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

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

      const res = await fetch(
        `${apiBaseUrl}/onboarding/karaoke`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            karaokeName: formData.karaokeName,
            ownerFullName: formData.ownerFullName || user?.fullName || "",
            phoneNumber: formData.phoneNumber,
            email:
              formData.email ||
              user?.primaryEmailAddress?.emailAddress ||
              "",
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
            images: formData.images
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            rulesPolicies: formData.rulesPolicies,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to register karaoke")
      }

      const karaokeId = data?.karaoke?._id

      setMessage("Karaoke registration submitted successfully.")
      setFormData(initialForm)
      router.push(
        karaokeId
          ? `/admin/karaoke/${encodeURIComponent(karaokeId)}/rooms`
          : "/admin/dashboard"
      )
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-xl rounded-2xl border p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Karaoke Register</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="karaokeName"
          placeholder="Karaoke name"
          value={formData.karaokeName}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <input
          type="text"
          name="ownerFullName"
          placeholder="Owner full name"
          value={formData.ownerFullName}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone number"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          rows={4}
          required
        />

        <input
          type="text"
          name="openingHours"
          placeholder="Opening hours"
          value={formData.openingHours}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="time"
            name="openingTime"
            value={formData.openingTime}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
            required
          />
          <input
            type="time"
            name="closingTime"
            value={formData.closingTime}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
            required
          />
        </div>

        <input
          type="text"
          name="roomTypes"
          placeholder="Room types, comma separated"
          value={formData.roomTypes}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <input
          type="number"
          name="pricePerHour"
          placeholder="Price per hour"
          value={formData.pricePerHour}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={formData.capacity}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <input
          type="text"
          name="amenities"
          placeholder="Amenities, comma separated"
          value={formData.amenities}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
        />

        <input
          type="text"
          name="images"
          placeholder="Image URLs, comma separated"
          value={formData.images}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
        />

        <textarea
          name="rulesPolicies"
          placeholder="Rules / policies"
          value={formData.rulesPolicies}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3"
          rows={4}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Karaoke"}
        </button>
      </form>

      {message ? <p className="mt-4 text-green-600">{message}</p> : null}
      {error ? <p className="mt-4 text-red-600">{error}</p> : null}
    </div>
  )
}
