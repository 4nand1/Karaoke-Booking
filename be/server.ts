import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./src/config/db";
import authRoutes from "./src/routes/auth.routes";
import onboardingRoutes from "./src/routes/onboarding.routes";
import { CategoryRouter } from "./src/routes/category.router";
import { MenuRouter } from "./src/routes/menuRouter";
import reviewRouter from "./src/routes/review.routes";


const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/categories", CategoryRouter);
app.use("/api/items", MenuRouter);
app.use("/api/reviews", reviewRouter);


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
