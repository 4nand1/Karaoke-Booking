import { Schema, model, models, type InferSchemaType, type Model } from "mongoose"

export const ORDER_STATUSES = ["pending", "confirmed", "cancelled"] as const

const orderSchema = new Schema(
  {
    userId: { type: String, default: null, index: true },
    karaokeId: { type: Schema.Types.ObjectId, ref: "Karaoke", required: true, index: true },
    roomId: { type: String, required: true },
    bookingType: { type: String, enum: ["guest", "customer"], default: "guest" },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    bookingDate: { type: String, required: true },
    bookingSlots: [{ type: String }],
    guestCount: { type: Number, default: 1, min: 1 },
    totalAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid", index: true },
    stripeSessionId: { type: String, default: null, index: true },
    menuItems: [
      {
        itemId: { type: String, default: null },
        name: { type: String, default: null },
        price: { type: Number, default: 0 },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
)

orderSchema.index({ karaokeId: 1, bookingDate: 1 })

export type Order = InferSchemaType<typeof orderSchema>

export const OrderModel = (models.Order as Model<Order>) || model("Order", orderSchema)
