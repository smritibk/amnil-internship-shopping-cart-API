import sequelize from "../config/db.configuration.js";
import Category from "../models/category.model.js";
import { fn, col, literal } from "sequelize";
import Product from "../models/product.model.js";

export const productByCategory = async (req, res) => {
  try {
    const categoryCounts = await Category.findAll({
      attributes: [
        "id",
        "name",
        [sequelize.fn("COUNT", sequelize.col("products.id")), "product_count"],
      ],
      include: [
        {
          model: Product,
          as: "products",
          attributes: [], // No need to include product attributes
        },
      ],
      group: ["Category.id", "Category.name"],
      order: [[sequelize.literal("product_count"), "DESC"]],
    //   raw: true,
    });
    

    // const data = (categoryCounts || []).map((item) => ({
    //     ...item,
    //     product_count: Number(item.product_count),
    // }));

    res.status(200).json({
      success: true,
      productByCategory: categoryCounts,
      message: "Product counts by category retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching category product counts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

