import { Router } from "express"
import { createOrders } from "../controllers/order/create.orders"

const router = Router()

router.post("/", createOrders)

export default router