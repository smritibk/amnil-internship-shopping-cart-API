import express from "express";
import { isCustomer } from "../middlewares/validate.roles.js";
import validateReqBody from "../middlewares/validate.req.body.js";
import { cartItemValidationSchema, updateCartItemValidationSchema } from "../validation/cart.validation.js";
import { addItemToCart, editCartItem, removeCartItem, viewCartItems } from "../controller/cart.controller.js";

const router = express.Router();

//add item to cart
router.post(
  "/cart/add",
  isCustomer,
  validateReqBody(cartItemValidationSchema),
  addItemToCart
);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add an item to the cart
 *     description: Allows a customer to add a product to their cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the product to add
 *               quantity:
 *                 type: integer
 *                 example: 2
 *                 description: Number of units of the product
 *     responses:
 *       201:
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product added to cart
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized (customer not logged in)
 *       500:
 *         description: Internal server error
 */

//view cart items
router.get("/cart/view", isCustomer, viewCartItems);

/**
 * @swagger
 * /cart/view:
 *   get:
 *     summary: View items in the cart
 *     description: Retrieve all items in the logged-in customer's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items in the cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart items fetched successfully
 *                 cartItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "8f83d8d3-9a1b-44f4-9e9c-7b52b7f63d4a"
 *                       productId:
 *                         type: string
 *                         format: uuid
 *                         example: "c6aee3a4-64e5-49f7-8d22-1fbb1a7cd50e"
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       product:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "iPhone 15"
 *                           price:
 *                             type: number
 *                             format: float
 *                             example: 1200.99
 *       401:
 *         description: Unauthorized (JWT missing or invalid)
 */

//edit cart item
router.put(
  "/cart/edit/:id",
  isCustomer,
  validateReqBody(updateCartItemValidationSchema),
  editCartItem
);

/**
 * @swagger
 * /cart/edit/{id}:
 *   put:
 *     summary: Edit an item in the cart
 *     description: Allows a customer to update the quantity of an item in their cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the cart item to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *                 description: The new quantity for the cart item.
 *     responses:
 *       200:
 *         description: Cart item updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart item updated"
 *                 cartItem:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     cartId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized (customer not logged in)
 *       404:
 *         description: Cart or cart item not found
 *       500:
 *         description: Internal server error
 */

//delete cart item
router.delete("/cart/delete/:id", isCustomer, removeCartItem);

/**
 * @swagger
 * /cart/delete/{id}:
 *   delete:
 *     summary: Remove an item from the cart
 *     description: Allows a customer to remove a specific item from their shopping cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the cart item to be removed.
 *     responses:
 *       200:
 *         description: Cart item removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart item removed successfully"
 *       401:
 *         description: Unauthorized (customer not logged in)
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Internal server error
 */

export default router;
