import type { ErrorRequestHandler } from "express"
import mongoose from "mongoose"

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function fail(status: number, message: string): never {
  throw new HttpError(status, message)
}

// Express 5 forwards rejected async handlers here, so routes can just throw.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message })
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({ message: "Not found" })
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: err.message })
  }

  console.error("Unhandled error:", err)
  return res.status(500).json({ message: "Internal server error" })
}

export const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")

export const textList = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

export const numberOrNull = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

// Copy only whitelisted keys that are present in the body.
export const pick = <K extends string>(body: Record<string, unknown>, keys: readonly K[]) =>
  Object.fromEntries(keys.filter((k) => body?.[k] !== undefined).map((k) => [k, body[k]])) as Partial<
    Record<K, unknown>
  >
