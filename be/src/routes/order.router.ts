import { Router } from "express"
import { getOrders } from "../controllers/order/get.orders"
import { createOrders } from "../controllers/order/create.orders"
import { updateOrder } from "../controllers/order/update.order"

const OrderRouter = Router()

OrderRouter.get("/", getOrders)
  .post("/", createOrders)
    .put("/:id", updateOrder)

export { OrderRouter }