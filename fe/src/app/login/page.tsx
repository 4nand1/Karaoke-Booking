"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginUser, saveAuthData } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const data = await loginUser(form)
      saveAuthData(data.token, data.user)

      if (data.user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-xl border p-6">
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
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

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-white"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm">
          Don&apos;t have an account? <Link href="/signup" className="underline">User sign up</Link>
        </p>

        <p className="text-sm">
          Own a karaoke? <Link href="/admin/signup" className="underline">Register your karaoke</Link>
        </p>
      </form>
    </div>
  )
}