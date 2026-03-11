"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveAuthData, signupUser } from "@/lib/auth"
import type { UserSignupPayload } from "@/types/auth"

export default function SignupPage() {
  const router = useRouter()

  const [form, setForm] = useState<UserSignupPayload>({
    name: "",
    email: "",
    password: "",
    role: "user",
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
      const data = await signupUser(form)
      saveAuthData(data.token, data.user)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-xl border p-6">
        <h1 className="text-2xl font-bold">User Sign Up</h1>

        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-md border px-3 py-2"
          required
        />

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
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm">
          Registering a karaoke business?{" "}
          <Link href="/admin/signup" className="underline">
            Register your karaoke
          </Link>
        </p>
      </form>
    </div>
  )
}