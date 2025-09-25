import Yup from "yup";

export const productValidationSchema = Yup.object().shape({
  id: Yup.string().uuid("ID must be a valid UUID").nullable(),
  name: Yup.string()
    .required("Name is required")
    .max(255, "Name must be less than 255 characters"),
  description: Yup.string().required("Description is required"),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price must be positive"),
  categoryId: Yup.string()
    .uuid("categoryId must be a valid UUID")
    .required("categoryId is required"),
//   category: Yup.string()
//     .oneOf(
//       ["Electronics", "Clothing", "Books", "Home", "Beauty"],
//       "Category is not valid"
//     )
//     .required("Category is required"),
  stock: Yup.number()
    .required("Stock is required")
    .min(0, "Stock must be positive"),
});

export const paginationDataValidationSchema = Yup.object({
  page: Yup.number().min(1).integer().default(1),
  limit: Yup.number().min(1).integer().default(2),
  searchText: Yup.string().trim().notRequired(),
});