import dotenv from "dotenv"
dotenv.config()

import type { Request, Response } from "express"
import { createApp } from "../src/app"
import { connectDB } from "../src/config/db"

const app = createApp()
let databaseConnectionPromise: Promise<void> | null = null

function ensureDatabaseConnection() {
  if (!databaseConnectionPromise) {
    databaseConnectionPromise = connectDB().then(() => undefined)
  }

  return databaseConnectionPromise
}

export default async function handler(req: Request, res: Response) {
  await ensureDatabaseConnection()
  return app(req, res)
}

