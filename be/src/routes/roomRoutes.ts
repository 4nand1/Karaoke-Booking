import { Router } from "express";
import { createRoom } from "../controllers/room/createRoom";
import { getRooms } from "../controllers/room/getRoom";
import { updateRoom } from "../controllers/room/updateRoom";
import { deleteRoom } from "../controllers/room/deleteRoom";
import { requireKaraokeAdmin } from "../middlewares/authMidlleware";

const RoomRouter = Router({ mergeParams: true });

RoomRouter.get("/", getRooms);
RoomRouter.post("/", requireKaraokeAdmin, createRoom);
RoomRouter.put("/:roomId", requireKaraokeAdmin, updateRoom);
RoomRouter.delete("/:roomId", requireKaraokeAdmin, deleteRoom);

export { RoomRouter };
