import { Router } from "express";
import { getOrders } from "../controllers/order/get.orders";
import { createOrders } from "../controllers/order/create.orders";


const OrderRouter = Router();

OrderRouter.get("/", getOrders)
  .post("/create", createOrders);

export { OrderRouter };
