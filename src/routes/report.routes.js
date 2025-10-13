import express from "express";
import { productByCategory } from "../controller/report.controller.js";

const router = express.Router();

router.get("/report/productByCategory", productByCategory);

/**
 * @swagger
 * /report/productByCategory:
 *   get:
 *     summary: Get product counts by category
 *     description: Retrieve the number of products in each category
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Product counts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       product_count:
 *                         type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */

export default router;
