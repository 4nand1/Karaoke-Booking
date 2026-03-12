"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

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
  const { isSignedIn } = useUser()

  const [form, setForm] = useState<KaraokeForm>({
    karaokeName: "",
    address: "",
    city: "",
    phone: "",
    description: "",
    openingTime: "",
    closingTime: "",
    latitude: "",
    longitude: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

    try {
      if (!isSignedIn) {
        router.push("/sign-in")
        return
      }

      const token = await getToken()

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/onboarding/karaoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Registration failed")
      }

      router.push("/admin/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4 rounded-xl border p-6">
        <h1 className="text-2xl font-bold">Register your karaoke</h1>

        <input
          name="karaokeName"
          value={form.karaokeName}
          onChange={handleChange}
          placeholder="Karaoke name"
          className="w-full rounded-md border px-3 py-2"
          required
        />

        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full rounded-md border px-3 py-2"
          required
        />

        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="City"
          className="w-full rounded-md border px-3 py-2"
          required
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full rounded-md border px-3 py-2"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="min-h-28 w-full rounded-md border px-3 py-2"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="openingTime"
            type="time"
            value={form.openingTime}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />
          <input
            name="closingTime"
            type="time"
            value={form.closingTime}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="latitude"
            type="number"
            step="any"
            value={form.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            className="w-full rounded-md border px-3 py-2"
          />
          <input
            name="longitude"
            type="number"
            step="any"
            value={form.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-white"
        >
          {loading ? "Submitting..." : "Register karaoke"}
        </button>
      </form>
    </div>
  )
}