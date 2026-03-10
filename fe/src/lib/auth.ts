import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from "@/types/auth"

const API_BASE_URL = "http://localhost:5000/api"

async function parseResponse(res: Response): Promise<AuthResponse> {
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data as AuthResponse
}

export async function signupUser(payload: SignupPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(res)
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(res)
}

export function saveAuthData(token: string, user: AuthUser) {
  if (typeof window === "undefined") return

  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))
  window.dispatchEvent(new Event("auth-changed"))
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null

  const storedUser = localStorage.getItem("user")
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    localStorage.removeItem("user")
    return null
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function logoutUser() {
  if (typeof window === "undefined") return

  localStorage.removeItem("token")
  localStorage.removeItem("user")
  window.dispatchEvent(new Event("auth-changed"))
}

export function isAuthenticated(): boolean {
  return !!getStoredToken()
}