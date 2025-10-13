import dotenv from "dotenv";
import express from "express";
import sequelize from "./config/db.configuration.js";

dotenv.config();

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cors from "cors";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import excelRoutes from "./routes/export.to.excel.routes.js";
import pdfRoutes from "./routes/export.as.pdf.routes.js";
import reportRoutes from "./routes/report.routes.js";

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080"], //access-control-allow-origin
    credentials: true, //access-control-allow-credentials:true
  })
);
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shopping Cart API",
      version: "1.0.0",
      description: "API documentation for the Shopping Cart application",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "integer" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(orderRoutes);
app.use(excelRoutes);
app.use(pdfRoutes);
app.use(reportRoutes);

//database configuration and server start
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database connected and models synchronized");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
