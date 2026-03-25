import express from "express"
import cors from "cors"
import { clerkMiddleware } from "@clerk/express"

import authRoutes from "./routes/auth.routes"
import onboardingRoutes from "./routes/onboarding.routes"
import { CategoryRouter } from "./routes/category.router"
import { MenuRouter } from "./routes/menuRouter"
import reviewRouter from "./routes/review.routes"
import { KaraokeRouter } from "./routes/karaokeRoutes"
import bookingRoutes from "./routes/booking.routes"
import { OrderRouter } from "./routes/order.router"
import paymentRouter from "./routes/payment.routes"

function getAllowedOrigins() {
  const rawOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.ALLOWED_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(rawOrigins))
}

function getClerkConfig() {
  const publishableKey =
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secretKey = process.env.CLERK_SECRET_KEY

  if (!secretKey) {
    throw new Error("Missing CLERK_SECRET_KEY in backend environment")
  }

  if (!publishableKey) {
    console.warn(
      "CLERK_PUBLISHABLE_KEY is missing in backend environment, continuing with CLERK_SECRET_KEY only"
    )
  }

  return { publishableKey, secretKey }
}

export function createApp() {
  const app = express()
  const allowedOrigins = getAllowedOrigins()
  const { publishableKey, secretKey } = getClerkConfig()

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true)
          return
        }

        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }

        callback(new Error(`CORS blocked for origin: ${origin}`))
      },
      credentials: true,
    })
  )

  app.use("/api/payments", paymentRouter)
  app.use(express.json({ limit: "4mb" }))

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

  return app
}

