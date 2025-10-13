import express from "express";
import { dailyRevenuePDF } from "../controller/export.as.pdf.controller.js";
import { isSeller } from "../middlewares/validate.roles.js";

const router = express.Router();

router.get("/report/dailyRevenuePDF", isSeller, dailyRevenuePDF);

/**
 * @swagger
 * /report/dailyRevenuePDF:
 *   get:
 *     summary: Export daily revenue report to PDF
 *     description: Generates a PDF report containing daily revenue between given dates.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 */

export default router;
