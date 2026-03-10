import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { OrderRouter } from "./routes/order.router"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Karaoke booking backend is running")
})

app.use("/orders", OrderRouter);

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})