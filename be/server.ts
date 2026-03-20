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
import bookingRoutes from "./src/routes/bookingRoutes"

const app = express()

const publishableKey = process.env.CLERK_PUBLISHABLE_KEY
const secretKey = process.env.CLERK_SECRET_KEY

if (!publishableKey) {
  throw new Error("Missing CLERK_PUBLISHABLE_KEY in backend .env")
}

if (!secretKey) {
  throw new Error("Missing CLERK_SECRET_KEY in backend .env")
}

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)

app.use(express.json())

app.use(
  clerkMiddleware({
    publishableKey,
    secretKey,
  })
)

app.use("/api", authRoutes)
app.use("/api/onboarding", onboardingRoutes)
app.use("/api/categories", CategoryRouter)
app.use("/api/items", MenuRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api/booking", bookingRoutes)
app.use("/karaoke", KaraokeRouter)

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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(
      `Clerk loaded: pk=${publishableKey ? "yes" : "no"}, sk=${secretKey ? "yes" : "no"}`
    )
  })
})
