import axios from "axios"
import { apiBaseUrl } from "@/lib/api-url"

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

export const apiError = (e: unknown, fallback: string) =>
  axios.isAxiosError(e) ? (e.response?.data?.message as string) || fallback : fallback
