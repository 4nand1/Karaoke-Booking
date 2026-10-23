import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import { clerkMiddleware } from "@clerk/express"

import { connectDB } from "./config/db"
import { errorHandler } from "./lib/http"
import meRoutes from "./routes/me"
import onboardingRoutes from "./routes/onboarding"
import karaokeRoutes from "./routes/karaoke"
import orderRoutes from "./routes/orders"
import paymentRoutes from "./routes/payments"
import reviewRoutes from "./routes/reviews"

const secretKey = process.env.CLERK_SECRET_KEY
if (!secretKey) throw new Error("Missing CLERK_SECRET_KEY in backend .env")
const publishableKey =
  process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const allowedOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL, process.env.ALLOWED_ORIGINS]
  .flatMap((value) => String(value ?? "").split(","))
  .map((value) => value.trim())
  .filter(Boolean)
if (!allowedOrigins.length) allowedOrigins.push("http://localhost:3000")

const app = express()

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.get("/health", (_req, res) => {
  res.json({ ok: true })
})

// Stripe webhooks need the raw body, so payments mount before express.json().
app.use("/api/payments", paymentRoutes)
app.use(express.json({ limit: "4mb" }))
app.use(clerkMiddleware({ secretKey, ...(publishableKey ? { publishableKey } : {}) }))

app.use("/api", meRoutes)
app.use("/api/onboarding", onboardingRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/karaoke", karaokeRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 9000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

async function connectWithRetry() {
  for (;;) {
    try {
      return await connectDB()
    } catch (error) {
      console.error("MongoDB connection failed. Retrying in 5 seconds...", error)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}
void connectWithRetry()

export default app
