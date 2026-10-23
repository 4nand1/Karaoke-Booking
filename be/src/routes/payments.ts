import express, { Router } from "express"
import Stripe from "stripe"
import { OrderModel } from "../models/Order"
import { fail, text } from "../lib/http"

const router = Router()

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key || key.includes("your_stripe_secret_key")) fail(500, "Stripe is not configured")
  return new Stripe(key)
}

const clientUrl = () => process.env.CLIENT_URL?.trim() || "http://localhost:3000"

const markPaid = (orderId: string, sessionId: string) =>
  OrderModel.updateOne(
    { _id: orderId },
    { status: "confirmed", paymentStatus: "paid", stripeSessionId: sessionId }
  )

// Needs the raw body, so app.ts mounts this router before express.json().
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"]
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!signature || Array.isArray(signature)) fail(400, "Missing stripe-signature header")
  if (!secret) fail(500, "Missing STRIPE_WEBHOOK_SECRET")

  let event: Stripe.Event
  try {
    event = stripeClient().webhooks.constructEvent(req.body as Buffer, signature as string, secret)
  } catch {
    return fail(400, "Invalid Stripe signature")
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.bookingId
    if (orderId) await markPaid(orderId, session.id)
  }

  res.json({ received: true })
})

// The amount is always the order's server-computed total.
router.post("/create-checkout-session", express.json(), async (req, res) => {
  const order = (await OrderModel.findById(text(req.body?.bookingId))) ?? fail(404, "Order not found")
  if (order.paymentStatus === "paid" || order.status === "cancelled") fail(409, "This order can no longer be paid")
  if (order.totalAmount <= 0) fail(400, "Nothing to pay")

  const session = await stripeClient().checkout.sessions.create({
    mode: "payment",
    success_url: `${clientUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl()}/payment/cancel`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: (process.env.STRIPE_CURRENCY?.trim() || "usd").toLowerCase(),
          unit_amount: Math.round(order.totalAmount),
          product_data: { name: process.env.STRIPE_PRODUCT_NAME?.trim() || "Karaoke Room Booking" },
        },
      },
    ],
    metadata: { bookingId: String(order._id) },
  })

  if (!session.url) fail(502, "Stripe did not return a checkout URL")
  order.stripeSessionId = session.id
  await order.save()

  res.json({ url: session.url })
})

// Stripe is the source of truth; the session must also be the one we issued for that order.
router.get("/checkout-session/:sessionId", async (req, res) => {
  const session = await stripeClient().checkout.sessions.retrieve(String(req.params.sessionId))
  const orderId = session.metadata?.bookingId || ""
  const paid = session.payment_status === "paid"

  if (orderId && paid) {
    const order = await OrderModel.findById(orderId)
    if (order && order.stripeSessionId === session.id) await markPaid(orderId, session.id)
  }

  res.json({
    sessionId: session.id,
    bookingId: orderId || null,
    paid,
    paymentStatus: session.payment_status,
    status: session.status,
  })
})

export default router
