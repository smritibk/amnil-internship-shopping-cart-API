import Yup from "yup";
// const { isBefore } = require('date-fns'); // Optional: for date validation
import { isBefore } from "date-fns";

export const userValidationSchema = Yup.object().shape({
  id: Yup.string().uuid("ID must be a valid UUID").nullable(),

  email: Yup.string()
    .email("Must be a valid email")
    .required("Email is required")
    .max(255, "Email must be less than 255 characters"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must be less than 255 characters"),

  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),

  role: Yup.string()
    .oneOf(["seller", "customer"], "Role must be either seller or customer")
    .default("customer")
    .required("Role is required"),

  isVerified: Yup.boolean()
    .default(false)
    .required("Verification status is required"),

  otp: Yup.string().nullable().max(6, "OTP must be at most 6 characters"),

  otpExpiry: Yup.date()
    .nullable()
    .test(
      "is-future-date",
      "OTP expiry must be a future date",
      (value) => !value || isBefore(new Date(), new Date(value))
    ),

  resetToken: Yup.string()
    .nullable()
    .max(255, "Reset token must be less than 255 characters"),

  resetTokenExpiry: Yup.date()
    .nullable()
    .test(
      "is-future-date",
      "Reset token expiry must be a future date",
      (value) => !value || isBefore(new Date(), new Date(value))
    ),
});

export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Must be a valid email")
    .required("Email is required")
    .max(255, "Email must be less than 255 characters"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must be less than 255 characters"),
});

export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Must be a valid email")
    .required("Email is required"),
});

export const resetPasswordSchema = Yup.object().shape({
  resetToken: Yup.string(),
  newPassword: Yup.string()
    .required("Reset token is required")
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must be less than 255 characters"),
});
