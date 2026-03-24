import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import { clerkMiddleware } from "@clerk/express"

import { connectDB } from "./src/config/db"

import authRoutes from "./src/routes/auth.routes"
import onboardingRoutes from "./src/routes/onboarding.routes"
import { CategoryRouter } from "./src/routes/category.router"
import { MenuRouter } from "./src/routes/menuRouter"
import reviewRouter from "./src/routes/review.routes"
import { KaraokeRouter } from "./src/routes/karaokeRoutes"
import bookingRoutes from "./src/routes/booking.routes"
import { OrderRouter } from "./src/routes/order.router"
import paymentRouter from "./src/routes/payment.routes"

const app = express()
const clientUrl = process.env.CLIENT_URL?.trim() || "http://localhost:3000"

const publishableKey =
  process.env.CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const secretKey = process.env.CLERK_SECRET_KEY

if (!secretKey) {
  throw new Error("Missing CLERK_SECRET_KEY in backend .env")
}

if (!publishableKey) {
  console.warn(
    "CLERK_PUBLISHABLE_KEY is missing in backend .env, continuing with CLERK_SECRET_KEY only"
  )
}

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
)

app.use("/api/payments", paymentRouter)
app.use(express.json())

app.use(
  clerkMiddleware({
    secretKey,
    ...(publishableKey ? { publishableKey } : {}),
  })
)

app.use("/api", authRoutes)
app.use("/api/onboarding", onboardingRoutes)
app.use("/api/categories", CategoryRouter)
app.use("/api/items", MenuRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api/booking", bookingRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/karaoke", KaraokeRouter)
app.use("/api/orders", OrderRouter)

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Express error:", err)
    res.status(500).json({
      message: err?.message || "Internal server error",
    })
  }
)

const PORT = process.env.PORT || 9000
const DB_RETRY_DELAY_MS = 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(
    `Clerk loaded: pk=${publishableKey ? "yes" : "no"}, sk=${secretKey ? "yes" : "no"}`
  )
})

async function connectDatabaseWithRetry() {
  while (true) {
    try {
      await connectDB()
      return
    } catch (error) {
      console.error(
        `MongoDB connection failed. Retrying in ${DB_RETRY_DELAY_MS / 1000} seconds...`,
        error
      )
      await new Promise((resolve) => setTimeout(resolve, DB_RETRY_DELAY_MS))
    }
  }
}

void connectDatabaseWithRetry()
