import Yup from "yup";

export const orderValidationSchema = Yup.object().shape({
  cartId: Yup.string()
    .uuid("cartId must be a valid UUID")
    .required("cartId is required"),
  paymentMethod: Yup.string()
    .oneOf(["cod", "card", "esewa", "khalti"], "Invalid payment method")
    .required("paymentMethod is required"),
});
