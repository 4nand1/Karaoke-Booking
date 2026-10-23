import axios from "axios"

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "http://localhost:9000"

const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "")
const apiBaseUrl = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
})

// Attach the signed-in user's Clerk session token to every API call.
api.interceptors.request.use(async (config) => {
  const clerk =
    typeof window === "undefined"
      ? undefined
      : (window as { Clerk?: { session?: { getToken(): Promise<string | null> } | null } }).Clerk
  const token = await clerk?.session?.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export { apiBaseUrl }