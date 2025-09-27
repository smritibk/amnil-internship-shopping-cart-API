import Yup from "yup";

export const orderValidationSchema = Yup.object().shape({
  paymentMethod: Yup.string()
    .oneOf(["cod", "card", "esewa", "khalti"], "Invalid payment method")
    .required("paymentMethod is required"),
});
