import axios from "axios"

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:9000"

const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "")
const apiBaseUrl = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
})