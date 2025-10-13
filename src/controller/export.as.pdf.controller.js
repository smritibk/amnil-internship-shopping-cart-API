import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { dailyRevenueData } from "./order.controller.js";
import pkg from "pdfkit";
import { fileURLToPath } from "url";
import { transporter } from "../utils/mailer.js";

const { end } = pkg;

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dailyRevenuePDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await dailyRevenueData(startDate, endDate);

    // Ensure directory exists
    const pdfDir = path.join(__dirname, "../../excelFile");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    const filePath = path.join(pdfDir, "daily_revenue_report.pdf");

    //create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Title
    doc.fontSize(18).text("Daily Revenue Report", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`From: ${startDate} To: ${endDate}`, { align: "center" });
    doc.moveDown(2);

    // Table Header
    doc.fontSize(12).text("Date", 100, doc.y, { continued: true });
    doc.text("Total Revenue (Rs)", 250);
    doc.moveDown();

    // Table Content
    data.forEach((item) => {
      doc.text(item.date, 100, doc.y, { continued: true });
      doc.text(item.totalRevenue.toString(), 250);
    });

    doc.end();

    // Wait until file is done writing
    stream.on("finish", async () => {
      //Send email with attachment
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: req.loggedInUserEmail, // replace with your own or dynamic one
        subject: "Daily Revenue Report",
        text: `Attached is your daily revenue report for ${startDate} to ${endDate}.`,
        attachments: [
          {
            filename: "daily_revenue_report.pdf",
            path: filePath,
          },
        ],
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "PDF report generated successfully",
        filePath,
      });
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF report" });
  }
};
