import { Schema, model, models } from "mongoose"

const orderSchema = new Schema(
  {
    userId: { type: String, required: false, index: true },
    bookingType: {
      type: String,
      enum: ["guest", "customer"],
      required: true,
      default: "guest",
    },
    guestPhoneNumber: { type: String, default: null },
    guestConfirmationCode: { type: String, default: null },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    BookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    totalAmount: { type: Number, required: true },
    Location: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

export const OrderModel = models.Order || model("Order", orderSchema)