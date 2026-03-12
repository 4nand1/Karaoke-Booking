"use client"

<<<<<<< HEAD
import { useState, type ChangeEvent, type FormEvent } from "react"
=======
import { useState, type ChangeEvent } from "react"
>>>>>>> 3072d7d (register karaoke)
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
<<<<<<< HEAD
  latitude: string
  longitude: string
=======
>>>>>>> 3072d7d (register karaoke)
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
<<<<<<< HEAD
    latitude: "",
    longitude: "",
=======
>>>>>>> 3072d7d (register karaoke)
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

<<<<<<< HEAD
  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
=======
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
>>>>>>> 3072d7d (register karaoke)
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

<<<<<<< HEAD
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
=======
  async function handleSubmit(e: React.FormEvent) {
>>>>>>> 3072d7d (register karaoke)
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
<<<<<<< HEAD
        body: JSON.stringify({
          ...form,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        }),
=======
        body: JSON.stringify(form),
>>>>>>> 3072d7d (register karaoke)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Registration failed")
      }

<<<<<<< HEAD
      router.push("/admin/dashboard")
=======
      router.push(`/admin/karaoke/${data._id}/rooms`)
>>>>>>> 3072d7d (register karaoke)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Register your karaoke</h1>
          <p className="mt-1 text-sm text-gray-500">Fill in your venue details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Karaoke name</label>
            <input
              name="karaokeName"
              value={form.karaokeName}
              onChange={handleChange}
              placeholder="Star Karaoke"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Peace Ave"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ulaanbaatar"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="99001122"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell customers about your venue..."
              className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Opening time</label>
              <input
                name="openingTime"
                type="time"
                value={form.openingTime}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Closing time</label>
              <input
                name="closingTime"
                type="time"
                value={form.closingTime}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                required
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue to rooms →"}
          </button>
        </form>
      </div>
>>>>>>> 3072d7d (register karaoke)
    </div>
  )
}