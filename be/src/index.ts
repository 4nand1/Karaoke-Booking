import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { OrderRouter } from "./routes/order.router";
import { KaraokeRouter } from "./routes/karaokeRoutes";
import { RoomRouter } from "./routes/roomRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use((req, _res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("backend running");
});

app.use("/karaoke", KaraokeRouter);
app.use("/orders", OrderRouter);
app.use("/karaoke/:id/rooms", RoomRouter);

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("MongoDB success"))
  .catch((err) => console.error("MongoDB error", err));

const PORT = 9000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});