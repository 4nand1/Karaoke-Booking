import express, { Router } from "express"
import {
  createCheckoutSession,
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

export default paymentRouter
