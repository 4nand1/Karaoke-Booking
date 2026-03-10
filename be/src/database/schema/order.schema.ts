import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    BookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    totalAmount: { type: Number, required: true },
    Location: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const OrderModel = model("Order", orderSchema);
