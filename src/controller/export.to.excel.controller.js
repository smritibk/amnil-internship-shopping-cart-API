import ExcelJS from "exceljs";
import {
  dailyRevenueData,
  mostPlacedProductsData,
} from "./order.controller.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { transporter } from "../utils/mailer.js";

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dailyRevenueToExcel = async (req, res) => {
  try {
    // start and end date from query
    const { startDate, endDate } = req.query;

    // Instead of directly calling res.json() in totalRevenueByDate,
    // you can refactor it slightly to return the data.
    const data = await dailyRevenueData(startDate, endDate); // helper that returns data only
    // console.log(data);

    // Create Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Revenue Report");

    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Total Revenue", key: "totalRevenue", width: 20 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        date: item.date,
        totalRevenue: item.totalRevenue,
      });
    });

    //absolute path to excelFile directory
    const excelDir = path.join(__dirname, "../../excelFile");

    //ensure directory exists
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }

    // const filePath = "../../excelFile/daily_revenue_report.xlsx";
    const filePath = path.join(excelDir, "daily_revenue_report.xlsx");

    await workbook.xlsx.writeFile(filePath);

    //Send email with attachment
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.loggedInUserEmail, // replace with your own or dynamic one
      subject: "Daily Revenue Report",
      text: `Attached is your daily revenue report for ${startDate} to ${endDate}.`,
      attachments: [
        {
          filename: "daily_revenue_report.xlsx",
          path: filePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Excel file created and email sent successfully",
      filePath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to export revenue data" });
  }
};

export const mostPlacedProductToExcel = async (req, res) => {
  try {
    const data = await mostPlacedProductsData();
    console.log("This is most sold products", data);

    // Create Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Revenue Report");

    worksheet.columns = [
      { header: "Product Name", key: "product.name", width: 15 },
      { header: "Total Quantity", key: "totalQuantity", width: 20 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        name: item.product.name,
        totalQuantity: item.totalQuantity,
      });
    });

    //absolute path to excelFile directory
    const excelDir = path.join(__dirname, "../../excelFile");

    //ensure directory exists
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }

    // const filePath = "../../excelFile/daily_revenue_report.xlsx";
    const filePath = path.join(excelDir, "most_placed_products_report.xlsx");

    await workbook.xlsx.writeFile(filePath);

    res.status(200).json({
      message: "Excel file created and email sent successfully",
      filePath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to export revenue data" });
  }
};
