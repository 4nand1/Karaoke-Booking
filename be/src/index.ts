import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OrderRouter } from "./routes/order.router";
import { KaraokeRouter } from "./routes/karaokeRoutes";
import mongoose from "mongoose";
import { RoomRouter } from "./routes/roomRoutes";
import { MenuRouter } from "./routes/menuRouter";
import { CategoryRouter } from "./routes/category.router";

dotenv.config()

const app = express()

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI!)
  .then(() => console.log("MongoDB success"))
  .catch((err) => console.error("MongoDB error", err));

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Karaoke booking backend is running");
});

app.use("/orders", OrderRouter);
app.use("/karaoke", KaraokeRouter);
app.use("/orders", OrderRouter);
app.use("/karaoke", KaraokeRouter);
app.use("/karaoke/:id/rooms", RoomRouter);
app.use("/categories", CategoryRouter);
app.use("/karaoke/:id/menu", MenuRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
