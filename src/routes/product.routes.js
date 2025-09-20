import express from "express";
import { isCustomer, isSeller } from "../middlewares/validate.roles.js";
import validateReqBody from "../middlewares/validate.req.body.js";
import {
  paginationDataValidationSchema,
  productValidationSchema,
} from "../validation/product.validation.js";
import {
  addProduct,
  editProduct,
  viewProductsCustomer,
  viewProductsSeller,
} from "../controller/product.controller.js";

const router = express.Router();

//add product
router.post(
  "/add/product",
  isSeller,
  validateReqBody(productValidationSchema),
  addProduct
);

/**
 * @swagger
 * /add/product:
 *  post:
 *    summary: Add a new product
 *    description: Add a new product with name, description, price, and stock.
 *    tags: [Product]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required: [name, description, price, stock]
 *            properties:
 *              name:
 *                type: string
 *              description:
 *                type: string
 *              price:
 *                type: number
 *              stock:
 *                type: number
 *    responses:
 *       201:
 *         description: Product added successfully
 *
 */

//view products as a customer
router.get("/view/products/customer", isCustomer, viewProductsCustomer);

/**
 * @swagger
 * /view/products/customer:
 *  get:
 *    summary: View products (for customers)
 *    description: Get a paginated list of products with optional search by product name.
 *    tags: [Product]
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        required: true
 *        description: Page number for pagination
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        required: true
 *        description: Number of products per page
 *      - in: query
 *        name: searchText
 *        schema:
 *          type: string
 *        required: false
 *        description: Optional search text to filter products by name
 *    responses:
 *      200:
 *        description: Products retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                productDetails:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                      description:
 *                        type: string
 *                      price:
 *                        type: number
 *                        format: float
 *                      stock:
 *                        type: integer
 */

//view products as a seller
router.get("/view/products/seller", isSeller, viewProductsSeller);

/**
 * @swagger
 * /view/products/seller:
 *  get:
 *    summary: View products (for sellers)
 *    description: Get a paginated list of products with optional search by product name.
 *    tags: [Product]
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        required: true
 *        description: Page number for pagination
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        required: true
 *        description: Number of products per page
 *      - in: query
 *        name: searchText
 *        schema:
 *          type: string
 *        required: false
 *        description: Optional search text to filter products by name
 *    responses:
 *      200:
 *        description: Products retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                productDetails:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                      description:
 *                        type: string
 *                      price:
 *                        type: number
 *                        format: float
 *                      stock:
 *                        type: integer
 */

//edit product
router.put("/edit/product/:id", isSeller, validateReqBody(productValidationSchema), editProduct);

//delete product
// router.delete("/delete/product/:id", isSeller, deleteProduct);

export default router;
