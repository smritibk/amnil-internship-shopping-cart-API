import express from "express";
import { isCustomer, isSeller } from "../middlewares/validate.roles.js";
import validateReqBody from "../middlewares/validate.req.body.js";
import { productValidationSchema } from "../validation/product.validation.js";
import {
  addCategory,
  addProduct,
  deleteProduct,
  editProduct,
  filterProductsByPrice,
  listCategories,
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
 *            required: [name, description, price, stock, categoryId]
 *            properties:
 *              name:
 *                type: string
 *              description:
 *                type: string
 *              price:
 *                type: number
 *              stock:
 *                type: number
 *              categoryId:
 *                type: string
 *                format: uuid
 *                required: true
 *                description: The unique category ID
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
 *   get:
 *     summary: View products (for customers)
 *     description: Get a paginated list of products with optional filters.
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: true
 *         description: Number of products per page
 *       - in: query
 *         name: searchText
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional search text to filter products by name
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           format: float
 *         required: false
 *         description: Optional minimum price to filter products
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: float
 *         required: false
 *         description: Optional maximum price to filter products
 *       - in: query
 *         name: categoryIds
 *         schema:
 *           type: string
 *         required: false
 *         description: Comma-separated category UUIDs (e.g., id1,id2)
 *       - in: query
 *         name: categoryNames
 *         schema:
 *           type: string
 *         required: false
 *         description: Comma-separated category names (e.g., Electronics,Books)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt]
 *           default: createdAt
 *         required: false
 *         description: Field to sort products by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         required: false
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 productDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                         format: float
 *                       stock:
 *                         type: integer
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
router.put(
  "/edit/product/:id",
  isSeller,
  validateReqBody(productValidationSchema),
  editProduct
);

/**
 * @swagger
 * /edit/product/{id}:
 *   put:
 *     summary: Edit an existing product
 *     description: Update product details by its ID. Only the product owner (seller) can edit.
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: decimal
 *               stock:
 *                 type: integer
 *             example:
 *               name: "iPhone 15 Pro"
 *               description: "Latest iPhone model with A17 chip"
 *               price: 1299.99
 *               stock: 20
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Not authorized (not the product owner)
 *       404:
 *         description: Product not found
 */

//delete product
router.delete("/delete/product/:id", isSeller, deleteProduct);

/**
 * @swagger
 * /delete/product/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete an existing product by its ID. Only the product owner (seller) can delete.
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       403:
 *         description: Not authorized (not the product owner)
 *       404:
 *         description: Product not found
 */

//filter products by price range
router.get("/filter/products", isCustomer, filterProductsByPrice);

/**
 * @swagger
 * /filter/products:
 *   get:
 *     summary: Filter products by price range
 *     description: Retrieve products that fall within a given minimum and maximum price.
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           format: float
 *         required: false
 *         description: Minimum product price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: float
 *         required: false
 *         description: Maximum product price
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           format: int32
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           format: int32
 *         required: false
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: List of filtered products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Filtered products
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized (not a customer)
 *       500:
 *         description: Server error
 */

// add category (seller only)
router.post("/category", isSeller, addCategory);

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Add a new category
 *     description: Add a new category for products. Only sellers can add categories.
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category added successfully
 */

// list categories (public)
router.get("/categories", listCategories);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve all categories.
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Categories retrieved successfully
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
export default router;
