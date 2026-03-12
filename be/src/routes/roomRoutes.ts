import { Router } from "express";
import { createRoom } from "../controllers/room/createRoom";
import { getRooms } from "../controllers/room/getRoom";
import { updateRoom } from "../controllers/room/updateRoom";
import { deleteRoom } from "../controllers/room/deleteRoom";

const RoomRouter = Router({ mergeParams: true });

RoomRouter.get("/", getRooms);
RoomRouter.post("/", createRoom);
RoomRouter.put("/:roomId", updateRoom);
RoomRouter.delete("/:roomId", deleteRoom);

export { RoomRouter };