import express from "express";
import { placeOrder, viewOrders } from "../controller/order.controller.js";
import { isCustomer } from "../middlewares/validate.roles.js";
import validateReqBody from "../middlewares/validate.req.body.js";
import { orderValidationSchema } from "../validation/order.validation.js";

const router = express.Router();

router.post("/order/place", isCustomer, validateReqBody(orderValidationSchema), placeOrder);

/**
 * @swagger
 * /order/place:
 *   post:
 *     summary: Place an order from the cart
 *     description: Allows a customer to place an order using their cart. It creates an order with order items and clears the cart.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []   # ✅ requires JWT token since `isCustomer` middleware is used
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartId:
 *                 type: string
 *                 example: "1"
 *               paymentMethod:
 *                 type: string
 *                 enum: [cod, card, esewa, khalti]
 *                 example: cod
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order placed successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     userId:
 *                       type: integer
 *                       example: 3
 *                     totalAmount:
 *                       type: number
 *                       example: 2500
 *                     status:
 *                       type: string
 *                       example: pending
 *                     paymentMethod:
 *                       type: string
 *                       example: cod
 *                 orderItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 22
 *                       orderId:
 *                         type: integer
 *                         example: 10
 *                       productId:
 *                         type: integer
 *                         example: 5
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       price:
 *                         type: number
 *                         example: 1250
 *       400:
 *         description: Cart is empty or validation error
 *       404:
 *         description: Cart not found or product not found
 *       500:
 *         description: Internal server error
 */

//view orders for logged in user
router.get("/order/view", isCustomer, viewOrders);

/**
 * @swagger
 * /order/view:
 *   get:
 *     summary: View customer orders
 *     description: Retrieve all orders for the authenticated customer. Returns a list of orders with their details.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []   # ✅ requires JWT token since `isCustomer` middleware is used
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Orders retrieved successfully
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       userId:
 *                         type: integer
 *                         example: 3
 *                       totalAmount:
 *                         type: number
 *                         example: 2500
 *                       status:
 *                         type: string
 *                         example: pending
 *                       paymentMethod:
 *                         type: string
 *                         example: cod
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-10-15T10:30:00Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-10-15T10:30:00Z
 *                       orderItems:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 22
 *                             orderId:
 *                               type: integer
 *                               example: 10
 *                             productId:
 *                               type: integer
 *                               example: 5
 *                             productName:
 *                               type: string
 *                               example: "Wireless Headphones"
 *                             quantity:
 *                               type: integer
 *                               example: 2
 *                             price:
 *                               type: number
 *                               example: 1250
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Customer access required
 *       404:
 *         description: No orders found for the customer
 *       500:
 *         description: Internal server error
 */



export default router;