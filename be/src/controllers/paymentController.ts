import type { Request, Response } from "express"
import Stripe from "stripe"
import { OrderModel } from "../database/schema/order.schema"

type CreateCheckoutSessionBody = {
  bookingId?: string
  roomName?: string
  amount?: number
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim()

  if (
    !secretKey ||
    secretKey === "sk_test_your_stripe_secret_key" ||
    secretKey.includes("your_stripe_secret_key")
  ) {
    throw new Error(
      "Stripe is not configured. Replace STRIPE_SECRET_KEY in be/.env with a real Stripe secret key."
    )
  }

  return new Stripe(secretKey)
}

function getClientUrl() {
  return process.env.CLIENT_URL?.trim() || "http://localhost:3000"
}

function getCurrency() {
  return (process.env.STRIPE_CURRENCY?.trim() || "usd").toLowerCase()
}

function getProductName() {
  return process.env.STRIPE_PRODUCT_NAME?.trim() || "Karaoke Room Booking"
}

function normalizeAmount(amount?: number) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return 10000
  }

  return Math.round(amount)
}

export const createCheckoutSession = async (
  req: Request<unknown, unknown, CreateCheckoutSessionBody>,
  res: Response
) => {
  try {
    const stripe = getStripeClient()
    const bookingId = req.body?.bookingId?.trim()
    const roomName = req.body?.roomName?.trim()
    const amount = normalizeAmount(req.body?.amount)
    const clientUrl = getClientUrl()
    const currency = getCurrency()
    const productName = roomName
      ? `${getProductName()} - ${roomName}`
      : getProductName()

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/cancel`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: productName,
            },
          },
        },
      ],
      metadata: {
        bookingId: bookingId || "",
        roomName: roomName || "",
        amount: String(amount),
      },
    })

    if (bookingId && session.id) {
      await OrderModel.findByIdAndUpdate(bookingId, {
        stripeSessionId: session.id,
      })
    }

    if (!session.url) {
      return res.status(500).json({
        message: "Stripe checkout session URL was not returned",
      })
    }

    return res.status(200).json({
      url: session.url,
    })
  } catch (error) {
    console.error("createCheckoutSession error:", error)

    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to create checkout session",
    })
  }
}

export const verifyCheckoutSession = async (req: Request, res: Response) => {
  try {
    const stripe = getStripeClient()
    const rawSessionId = req.params.sessionId
    const sessionId =
      typeof rawSessionId === "string" ? rawSessionId.trim() : ""

    if (!sessionId) {
      return res.status(400).json({ message: "Missing checkout session id" })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const bookingId =
      typeof session.metadata?.bookingId === "string"
        ? session.metadata.bookingId.trim()
        : ""
    const isPaid =
      session.payment_status === "paid" || session.status === "complete"

    if (bookingId && isPaid) {
      await OrderModel.findByIdAndUpdate(bookingId, {
        status: "confirmed",
        paymentStatus: "paid",
        stripeSessionId: session.id,
      })
    }

    return res.status(200).json({
      sessionId: session.id,
      bookingId: bookingId || null,
      paid: isPaid,
      paymentStatus: session.payment_status,
      status: session.status,
    })
  } catch (error) {
    console.error("verifyCheckoutSession error:", error)

    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to verify checkout session",
    })
  }
}

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"]

  if (!signature || Array.isArray(signature)) {
    return res.status(400).json({
      message: "Missing stripe-signature header",
    })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()

  if (!webhookSecret) {
    return res.status(500).json({
      message: "Missing STRIPE_WEBHOOK_SECRET in backend .env",
    })
  }

  try {
    const stripe = getStripeClient()
    const event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      webhookSecret
    )

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.bookingId?.trim()

        if (bookingId) {
          await OrderModel.findByIdAndUpdate(bookingId, {
            status: "confirmed",
            paymentStatus: "paid",
            stripeSessionId: session.id,
          })
        }

        console.log("Stripe checkout completed:", {
          sessionId: session.id,
          bookingId: bookingId || null,
          roomName: session.metadata?.roomName || null,
        })

        break
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error("handleStripeWebhook error:", error)

    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to verify Stripe webhook",
    })
  }
}
