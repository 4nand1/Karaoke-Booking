import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import { clerkMiddleware } from "@clerk/express"
import { connectDB } from "./config/db"
import authRoutes from "./routes/auth.routes"
import onboardingRoutes from "./routes/onboarding.routes"

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)
app.use(express.json())
app.use(clerkMiddleware())

app.use("/api", authRoutes)
app.use("/api/onboarding", onboardingRoutes)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})