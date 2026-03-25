import { Schema, model, models } from "mongoose"

const orderSchema = new Schema(
  {
    userId: { type: String, default: null, index: true },
    karaokeId: { type: Schema.Types.ObjectId, ref: "Karaoke", required: true, index: true },
    roomId: { type: String, required: true },
    bookingType: { type: String, enum: ["guest", "customer"], default: "guest" },
    guestPhoneNumber: { type: String, default: null },
    guestConfirmationCode: { type: String, default: null },
    customerName: { type: String, default: null },
    customerPhone: { type: String, default: null },
    bookingDate: { type: String, required: true },
    bookingSlots: [{ type: String }],
    guestCount: { type: Number, default: 1 },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
      index: true,
    },
    stripeSessionId: { type: String, default: null, index: true },
    menuItems: [{
  itemId: { type: String, default: null },
  name: { type: String, default: null },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
}],
  },
  { timestamps: true }
)

export const OrderModel = models.Order || model("Order", orderSchema)
