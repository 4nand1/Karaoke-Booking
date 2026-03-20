import { Request, Response } from "express";
import Booking from "../models/Booking";
import { KaraokeModel } from "../models/Karaoke";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      karaokeId,
      roomId,
      customerName,
      customerPhone,
      bookingDate,
      bookingTime,
      bookingSlots,
      guestCount,
    } = req.body ?? {};

    if (
      !karaokeId ||
      !roomId ||
      !customerName ||
      !customerPhone ||
      !bookingDate ||
      !guestCount
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking fields",
      });
    }

    const karaoke = await KaraokeModel.findById(karaokeId);

    if (!karaoke) {
      return res.status(404).json({
        success: false,
        message: "Karaoke not found",
      });
    }

    const room =
      karaoke.rooms.id(roomId) ??
      karaoke.rooms.find((item: { _id?: unknown }) => String(item._id) === roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const normalizedGuestCount = Number(guestCount);

    if (Number.isNaN(normalizedGuestCount) || normalizedGuestCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Guest count must be at least 1",
      });
    }

    const normalizedBookingSlots = Array.isArray(bookingSlots)
      ? bookingSlots
          .map((slot) => (typeof slot === "string" ? slot.trim() : ""))
          .filter(Boolean)
      : typeof bookingTime === "string" && bookingTime.trim()
        ? [bookingTime.trim()]
        : [];

    if (!normalizedBookingSlots.length) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one booking time",
      });
    }

    const booking = await Booking.create({
      karaokeId: String(karaoke._id),
      karaokeName: karaoke.name,
      ownerClerkUserId: karaoke.ownerClerkUserId,
      roomId: String(room._id),
      roomName: room.name,
      roomType: room.type,
      customerName,
      customerPhone,
      bookingDate,
      bookingTime: normalizedBookingSlots.join(", "),
      bookingSlots: normalizedBookingSlots,
      totalHours: normalizedBookingSlots.length,
      guestCount: normalizedGuestCount,
      totalAmount: room.price * normalizedBookingSlots.length,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("createBooking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

export const getBookingsByOwner = async (req: Request, res: Response) => {
  try {
    const { ownerClerkUserId } = req.params;

    const bookings = await Booking.find({ ownerClerkUserId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("getBookingsByOwner error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};
