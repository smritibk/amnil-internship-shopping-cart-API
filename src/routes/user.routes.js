import express from "express";
import validateReqBody from "../middlewares/validate.req.body.js";
import {
  forgotPasswordSchema,
  loginValidationSchema,
  resetPasswordSchema,
  userValidationSchema,
} from "../validation/user.model.validation.js";
import {
  forgetPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../controller/user.controller.js";
import { logoutUser } from "../controller/user.controller.js";

const router = express.Router();

// register new user
router.post(
  "/user/register",
  validateReqBody(userValidationSchema),
  registerUser
);

/**
 * @swagger
 * /user/register:
 *  post:
 *    summary: Register a new user
 *    description: Register a new user with name, email, and password.
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required: [name, email, password]
 *            properties:
 *              name:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *    responses:
 *       201:
 *         description: User registered successfully
 *
 */

//login user
router.post("/user/login", validateReqBody(loginValidationSchema), loginUser);

/**
 * @swagger
 * /user/login:
 *  post:
 *    summary: Login a user
 *    description: logging in a user with email, and password.
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required: [email, password]
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *    responses:
 *       201:
 *         description: User logged in successfully
 *
 */

//logout user
router.post("/user/logout", logoutUser);

/**
 * @swagger
 * /user/logout:
 *  post:
 *    summary: Logout a user
 *    description: Logging out a user by invalidating the refresh token.
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required: [email]
 *            properties:
 *              email:
 *                type: string
 *    responses:
 *       201:
 *         description: User logged out successfully
 *
 */

//forget password
router.post(
  "/user/forgetPassword",
  validateReqBody(forgotPasswordSchema),
  forgetPassword
);

/**
 * @swagger
 * /user/forgetPassword:
 *  post:
 *    summary: Request a password reset
 *    description: Send a password reset link to the user's email.
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required: [email]
 *            properties:
 *              email:
 *                type: string
 *    responses:
 *       201:
 *         description: Password reset email sent successfully
 *
 */

//reset password
router.post(
  "/user/resetPassword/:resetToken",
  validateReqBody(resetPasswordSchema),
  resetPassword
);

/**
 * @swagger
 * /user/resetPassword/{resetToken}:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */

export default router;
