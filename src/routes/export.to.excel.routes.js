import express from "express";
import { dailyRevenueToExcel } from "../controller/export.to.excel.controller.js";

const router = express.Router();

router.get("/report/dailyRevenueExcel", dailyRevenueToExcel);

/**
 * @swagger
 * /report/dailyRevenueExcel:
 *   get:
 *     summary: Export daily revenue report to Excel
 *     description: Generates an Excel (.xlsx) file containing total daily revenue between the specified start and end dates.
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering the daily revenue data (e.g., 2025-10-01)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering the daily revenue data (e.g., 2025-10-09)
 *     responses:
 *       200:
 *         description: Excel file generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Excel file created successfully
 *                 filePath:
 *                   type: string
 *                   example: ./total_revenue_report.xlsx
 *       400:
 *         description: Missing or invalid date parameters
 *       500:
 *         description: Internal server error while generating Excel file
 */

export default router;
