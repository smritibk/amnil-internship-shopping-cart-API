import express from "express";
import {
  dailyRevenue,
  getOrderDetailsById,
  mostPlacedProducts,
  placeOrder,
  totalRevenueByDate,
  totalSales,
  viewOrders,
} from "../controller/order.controller.js";
import validateReqBody from "../middlewares/validate.req.body.js";
import { isCustomer } from "../middlewares/validate.roles.js";
import { orderValidationSchema } from "../validation/order.validation.js";

const router = express.Router();

router.post(
  "/order/place",
  isCustomer,
  validateReqBody(orderValidationSchema),
  placeOrder
);

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

//get order details by id
router.get("/order/view/:id", isCustomer, getOrderDetailsById);

/**
 * @swagger
 * /order/view/{id}:
 *   get:
 *     summary: Get order details by ID
 *     description: Retrieve detailed information about a specific order. The customer can only view their own orders.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "10"
 *         description: The ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order details retrieved successfully
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
 *                       example: 2500.00
 *                     status:
 *                       type: string
 *                       example: confirmed
 *                     paymentMethod:
 *                       type: string
 *                       example: cod
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-15T10:30:00Z"
 *                     orderItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 22
 *                           productId:
 *                             type: integer
 *                             example: 5
 *                           productName:
 *                             type: string
 *                             example: "Wireless Headphones"
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *                           price:
 *                             type: number
 *                             example: 1250.00
 *       400:
 *         description: Invalid order ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Customer can only view their own orders
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */

//get most placed products
router.get("/order/summary", mostPlacedProducts);

/**
 * @swagger
 * /order/summary:
 *   get:
 *     summary: Get sales summary and most placed products
 *     description: Returns a summary of the seller's total sales and the top 5 most frequently placed products. Accessible only to authenticated sellers.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved sales summary and most placed products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: number
 *                       format: float
 *                       example: 15230.75
 *                     topProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                             example: "a56b7d8c-45d9-4b23-a8c4-6e2c1b92d3f5"
 *                           productName:
 *                             type: string
 *                             example: "Wireless Earbuds"
 *                           totalQuantity:
 *                             type: integer
 *                             example: 85
 *       401:
 *         description: Unauthorized — Seller authentication required
 *       500:
 *         description: Internal server error
 */

//get total sales by product sold
router.get("/order/totalSales", totalSales);

/**
 * @swagger
 * /order/totalSales:
 *   get:
 *     summary: Get total sales per product
 *     description: Returns total quantity sold and total revenue for each product. Accessible only to authenticated users (or sellers, depending on your auth rules).
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved total sales per product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         format: uuid
 *                         example: "a56b7d8c-45d9-4b23-a8c4-6e2c1b92d3f5"
 *                       productName:
 *                         type: string
 *                         example: "Wireless Earbuds"
 *                       totalQuantity:
 *                         type: integer
 *                         example: 230
 *                       totalRevenue:
 *                         type: number
 *                         format: float
 *                         example: 11500.75
 *       401:
 *         description: Unauthorized — Authentication required
 *       500:
 *         description: Internal server error
 */

router.get("/order/totalRevenueByDate", totalRevenueByDate);

/**
 * @swagger
 * /order/totalRevenueByDate:
 *   get:
 *     summary: Get total revenue by date range
 *     description: Returns the total revenue generated for each product within a specified date range. Requires `startDate` and `endDate` query parameters.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date for filtering orders (inclusive).
 *         example: "2025-10-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date for filtering orders (inclusive).
 *         example: "2025-10-09"
 *     responses:
 *       200:
 *         description: Successfully retrieved total revenue by date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         format: uuid
 *                         example: "e4f7c223-9912-4fd1-8ad1-4a5f31d9f7a1"
 *                       product:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Smart Watch"
 *                       totalRevenue:
 *                         type: number
 *                         format: float
 *                         example: 18999.99
 *       400:
 *         description: Bad Request — startDate and endDate are required
 *       401:
 *         description: Unauthorized — Authentication required
 *       500:
 *         description: Internal server error
 */

//daily revenue 
router.get("/order/dailyRevenue", dailyRevenue)

/**
 * @swagger
 * /order/dailyRevenue:
 *   get:
 *     summary: Get daily revenue within a selected date range
 *     description: Returns total daily revenue for each day between startDate and endDate.
 *     tags: [Revenue]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successful response with daily revenue data
 *         content:
 *           application/json:
 *             example:
 *               dailyRevenue:
 *                 - date: "2025-10-01"
 *                   totalRevenue: "25000.00"
 *                 - date: "2025-10-02"
 *                   totalRevenue: "18000.00"
 *       400:
 *         description: Missing or invalid date parameters
 *         content:
 *           application/json:
 *             example:
 *               message: "startDate and endDate are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */


export default router;
