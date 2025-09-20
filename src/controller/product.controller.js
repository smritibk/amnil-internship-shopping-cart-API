import { Op } from "sequelize";
import Product from "../models/product.model.js";

//add product
export const addProduct = async (req, res) => {
  //extract newProduct from req.body
  const newProduct = req.body;
  // console.log(newProduct)

  //add seller Id
  newProduct.sellerId = req.loggedInUserId;

  //add product
  await Product.create(newProduct);

  // send res
  return res.status(201).send({ message: "Product added successfully." });
};

//view products as a customer
export const viewProductsCustomer = async (req, res) => {
  const { page, limit, searchText } = req.query;

  const skip = (page - 1) * limit;
  let where = {};

  if (searchText) {
    where.name = { [Op.iLike]: `%${searchText}%` };
  }

  const products = await Product.findAll({
    where,
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

//edit product
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
