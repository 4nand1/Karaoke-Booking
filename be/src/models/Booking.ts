import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  karaokeId: string;
  karaokeName: string;
  ownerClerkUserId: string;
  roomId: string;
  roomName: string;
  roomType: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  bookingSlots: string[];
  totalHours: number;
  guestCount: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    karaokeId: { type: String, required: true, index: true },
    karaokeName: { type: String, required: true, trim: true },
    ownerClerkUserId: { type: String, required: true, index: true },
    roomId: { type: String, required: true },
    roomName: { type: String, required: true, trim: true },
    roomType: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    bookingDate: { type: String, required: true },
    bookingTime: { type: String, required: true },
    bookingSlots: [{ type: String, required: true }],
    totalHours: { type: Number, required: true, min: 1 },
    guestCount: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
