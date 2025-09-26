import yup from "yup";

export const cartItemValidationSchema = yup.object().shape({
  productId: yup
    .string()
    .required("Product ID is required")
    .uuid("Product ID must be a valid UUID"),
  quantity: yup
    .number()
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
});

export const updateCartItemValidationSchema = yup.object().shape({
  quantity: yup
    .number()
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
});