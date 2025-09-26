import { Op } from "sequelize";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import validateReqBody from "../middlewares/validate.req.body.js";
import { categorySchema } from "../validation/category.validation.js";

//add product
export const addProduct = async (req, res) => {
  //check if product with same name exists for the seller
  const existingProduct = await Product.findOne({
    where: { name: req.body.name, sellerId: req.loggedInUserId },
  });

  if (existingProduct) {
    return res
      .status(409)
      .send({ message: "Product with same name already exists." });
  }

  //extract newProduct from req.body
  const newProduct = req.body;

  // ensure category exists
  if (newProduct.categoryId) {
    const category = await Category.findByPk(newProduct.categoryId);
    if (!category) {
      return res.status(404).send({ message: "Category does not exist." });
    }
  }
  // console.log(newProduct)

  //add seller Id
  newProduct.sellerId = req.loggedInUserId;

  //add product
  await Product.create(newProduct);

  // send res
  return res.status(201).send({ message: "Product added successfully." });
};

//add category
export const addCategory = async (req, res) => {
  try {
    // validate request body
    validateReqBody(categorySchema);

    // create new category
    const { name } = req.body;
    // prevent duplicate category names (case-insensitive)
    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(409).send({ message: "Category already exists" });
    }

    const newCategory = await Category.create({ name });

    // send response
    return res.status(201).send({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error" });
  }
};

// list all categories
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [["name", "ASC"]] });
    return res.status(200).send({ message: "Categories", categories });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error" });
  }
};

//get product by id
export const productById = async (req, res) => {
  try {
    // extract product id from req.params
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    return res.status(200).send({ message: "Product details", product });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error" });
  }
};

//view products as a customer
export const viewProductsCustomer = async (req, res) => {
  let {
    page,
    limit,
    searchText,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    categoryIds,
    categoryNames,
  } = req.query;

  const sortByOptions = ["name", "price", "createdAt"];
  if (!sortByOptions.includes(sortBy)) {
    sortBy = "createdAt";
  }

  const sortOrderOptions = ["ASC", "DESC"];
  if (!sortOrderOptions.includes(sortOrder)) {
    sortOrder = "DESC";
  }

  const skip = (page - 1) * limit;
  let where = {};

  if (searchText) {
    where.name = { [Op.iLike]: `%${searchText}%` };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const min = minPrice ?? 0;
    const max = maxPrice ?? Number.MAX_SAFE_INTEGER;
    where.price = {
      [Op.between]: [min, max],
    };
  }

  // filter by categories (ids or names)
  let categoryInclude = {
    model: Category,
    as: "category",
    attributes: ["id", "name"],
  };

  if (categoryIds) {
    const ids = String(categoryIds)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length > 0) {
      where.categoryId = { [Op.in]: ids };
    }
  } else if (categoryNames) {
    const names = String(categoryNames)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length > 0) {
      categoryInclude.where = { name: { [Op.in]: names } };
      categoryInclude.required = true;
    }
  }

  const products = await Product.findAll({
    where,
    include: [categoryInclude],
    order: [[sortBy || "createdAt", sortOrder || "DESC"]],
    offset: skip,
    limit,
    attributes: [
      "id",
      "name",
      "price",
      "stock",
      // Postgres substring
      [
        Product.sequelize.literal(`SUBSTRING("description", 1, 200)`),
        "description",
      ],
    ],
  });

  return res
    .status(201)
    .send({ message: "Products", productDetails: products });
};

//view products as a seller
export const viewProductsSeller = async (req, res) => {
  const { page, limit, searchText } = req.query;

  const skip = (page - 1) * limit;
  let where = { sellerId: req.loggedInUserId };

  if (searchText) {
    where.name = { [Op.iLike]: `%${searchText}%` };
  }

  const products = await Product.findAll({
    where,
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
    ],
    offset: skip,
    limit,
    attributes: [
      "id",
      "name",
      "price",
      "stock",
      // Postgres substring
      [
        Product.sequelize.literal(`SUBSTRING("description", 1, 200)`),
        "description",
      ],
    ],
  });

  return res
    .status(201)
    .send({ message: "Products", productDetails: products });
};

//edit product by id
export const editProduct = async (req, res) => {
  try {
    // extract product id from req.params
    const { id } = req.params;

    // find product by primary key
    const product = await Product.findByPk(id);

    // if product not found
    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }

    // check product ownership
    const isProductOwner = product.sellerId === req.loggedInUserId;
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: "You are not the product owner." });
    }

    // update product with new values
    await product.update(req.body);

    // send response
    return res.status(200).send({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error" });
  }
};

//delete product by id
export const deleteProduct = async (req, res) => {
  try {
    // extract product id from req.params
    const { id } = req.params;

    // find product by primary key
    const product = await Product.findByPk(id);

    // if product not found
    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }

    // check product ownership
    const isProductOwner = product.sellerId === req.loggedInUserId;
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: "You are not the product owner." });
    }

    // delete product
    await product.destroy();

    // send response
    return res.status(200).send({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error" });
  }
};

//filter products by price range
export const filterProductsByPrice = async (req, res) => {
  const { page, limit, minPrice, maxPrice } = req.query;

  const skip = (page - 1) * limit;

  const products = await Product.findAll({
    where: {
      price: {
        [Op.between]: [minPrice, maxPrice],
      },
    },
    offset: skip,
    limit,
  });

  return res
    .status(200)
    .send({ message: "Products", productDetails: products });
};
