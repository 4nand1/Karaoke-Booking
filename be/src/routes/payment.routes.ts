import express, { Router } from "express"
import {
  createCheckoutSession,
  verifyCheckoutSession,
  handleStripeWebhook,
} from "../controllers/paymentController"

const paymentRouter = Router()

paymentRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
)

paymentRouter.post(
  "/create-checkout-session",
  express.json(),
  createCheckoutSession
)

paymentRouter.get("/checkout-session/:sessionId", verifyCheckoutSession)

export default paymentRouter
