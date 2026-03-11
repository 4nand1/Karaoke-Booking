"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { saveAuthData, signupAdmin } from "@/lib/auth"
import type { AdminSignupPayload } from "@/types/auth"

export default function AdminSignupPage() {
  const router = useRouter()

  const [form, setForm] = useState<AdminSignupPayload>({
    name: "",
    email: "",
    password: "",
    role: "admin",
    karaokeName: "",
    address: "",
    city: "",
    phone: "",
    description: "",
    openingTime: "",
    closingTime: "",
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
      const data = await signupAdmin(form)
      saveAuthData(data.token, data.user)
      router.push("/admin/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Admin signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4 rounded-xl border p-6">
        <h1 className="text-2xl font-bold">Register Your Karaoke</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            name="name"
            placeholder="Owner name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Business email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />

          <input
            type="text"
            name="karaokeName"
            placeholder="Karaoke name"
            value={form.karaokeName}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />

          <input
            type="time"
            name="openingTime"
            value={form.openingTime}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />

          <input
            type="time"
            name="closingTime"
            value={form.closingTime}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <input
          type="text"
          name="address"
          placeholder="Full address"
          value={form.address}
          onChange={handleChange}
          className="w-full rounded-md border px-3 py-2"
          required
        />

        <textarea
          name="description"
          placeholder="Describe your karaoke"
          value={form.description}
          onChange={handleChange}
          className="min-h-28 w-full rounded-md border px-3 py-2"
          required
        />

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-white"
        >
          {loading ? "Registering..." : "Register Karaoke"}
        </button>
      </form>
    </div>
  )
}