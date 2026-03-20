import { Router } from "express";
import { createBooking, getBookingsByOwner } from "../controllers/bookingController";

const bookingRouter = Router();

bookingRouter.post("/", createBooking);
bookingRouter.get("/owner/:ownerClerkUserId", getBookingsByOwner);

export default bookingRouter;
