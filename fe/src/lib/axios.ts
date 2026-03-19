import axios from "axios"
import { apiBaseUrl } from "./api-url";

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
})
