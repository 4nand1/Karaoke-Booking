import dotenv from "dotenv"
dotenv.config()

import { connectDB } from "./src/config/db"
import { createApp } from "./src/app"

const PORT = process.env.PORT || 9000
const DB_RETRY_DELAY_MS = 5000
const app = createApp()

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

async function startServer() {
  await connectDatabaseWithRetry()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

if (!process.env.VERCEL) {
  void startServer()
}
