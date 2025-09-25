import Yup from "yup";

export const categorySchema = Yup.object().shape({
  id: Yup.string().uuid("ID must be a valid UUID").nullable(),
  name: Yup.string()
    .required("Name is required")
    .max(255, "Name must be less than 255 characters"),
});
