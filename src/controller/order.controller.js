import sequelize from "../config/db.configuration.js";
import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import Product from "../models/product.model.js";
import { Op, fn, col, literal } from "sequelize";

// place order
export const placeOrder = async (req, res) => {
  try {
    const userId = req.loggedInUserId;
    const { paymentMethod } = req.body;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId);
      console.log(product);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found for item ${item.id}` });
      }

      //if product stock is less than item quantity, return error
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}. Available stock: ${product.stock}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        orderId: null, // will set after creating order
        productId: product.id,
        quantity: item.quantity,
        price: product.price, // ✅ snapshot of product price at checkout
      });

      //reduce product stock here instead of after order creation
      //   product.stock -= item.quantity;
      //   await product.save();
    }

    // Create the order
    const order = await Order.create({
      userId,
      totalAmount,
      status: "pending",
      paymentMethod, // optional field if added in schema
    });

    // Attach orderId to orderItems
    orderItems.forEach((item) => (item.orderId = order.id));

    // Create OrderItems
    await OrderItem.bulkCreate(orderItems);

    // reduce stock of products
    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Clear the cart
    await CartItem.destroy({ where: { cartId: cart.id } });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
      orderItems,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//view orders for logged in user
export const viewOrders = async (req, res) => {
  try {
    const userId = req.loggedInUserId;
    const orders = await Order.findAll({ where: { userId } });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error viewing orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get order details by id
export const getOrderDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get most placed products
export const mostPlacedProducts = async (req, res) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        "productId",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["name"], // 👈 get product name
        },
      ],
      group: ["OrderItem.productId", "product.id"],
      order: [[sequelize.fn("SUM", sequelize.col("quantity")), "DESC"]],
      limit: 5,
    });

    return res.status(200).json({ topProducts });
  } catch (error) {
    console.error("Error fetching most placed products:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get total revenue by product sold
export const totalSales = async (req, res) => {
  try {
    const totalRevenue = await OrderItem.findAll({
      attributes: [
        "productId",
        [
          sequelize.fn(
            "SUM",
            sequelize.literal('"OrderItem"."quantity" * "OrderItem"."price"')
          ),
          "totalRevenue",
        ],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["name"],
        },
      ],
      group: ["productId", "product.id"],
    });

    return res.status(200).json({ totalRevenue });
  } catch (error) {
    console.error("Error fetching total revenue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get total revenue filtered by date range
export const totalRevenueByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalRevenue = await OrderItem.findAll({
      attributes: [
        // "productId",
        [
          sequelize.fn(
            "SUM",
            sequelize.literal('"OrderItem"."quantity" * "OrderItem"."price"')
          ),
          "totalRevenue",
        ],
      ],
      include: [
        // {
        //   model: Product,
        // as: "product",
        //   attributes: ["name"],
        // },
        {
          model: Order,
          as: "order",
          attributes: [], // we only need Order for filtering
          where: {
            createdAt: {
              [Op.between]: [start, end],
            },
          },
        },
      ],
      // group: ["productId", "Product.id"],
      raw: true, // return plain objects instead of Sequelize instances
    });

    return res.status(200).json({ totalRevenue });
  } catch (error) {
    console.error("Error fetching total revenue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get daily revenue

export const dailyRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // ✅ Add one day to include the full end date
    end.setDate(end.getDate() + 1);

    const dailyRevenue = await OrderItem.findAll({
      attributes: [
        // Convert createdAt to just DATE (without time) and alias it as "date"
        [sequelize.fn("DATE", col("order.createdAt")), "date"],
        [
          sequelize.fn(
            "SUM",
            literal('"OrderItem"."quantity" * "OrderItem"."price"')
          ),
          "totalRevenue",
        ],
      ],
      include: [
        {
          model: Order,
          as: "order",
          attributes: [], // only needed for filtering + grouping
          where: {
            createdAt: {
              [Op.between]: [start, end],
            },
          },
        },
      ],
      group: [sequelize.fn("DATE", col("order.createdAt"))],
      order: [[sequelize.fn("DATE", col("order.createdAt")), "ASC"]],
      raw: true,
    });

    return res.status(200).json({ dailyRevenue });
  } catch (error) {
    console.error("Error fetching daily revenue:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get order summary - top 5 most placed products and their total revenue

// export const orderSummary = async (req, res) => {
//   try {
//     const topProducts = await OrderItem.findAll({
//       attributes: [
//         "productId",
//         [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
//         [
//           sequelize.fn("SUM", sequelize.col("Order.totalAmount")),
//           "totalRevenue",
//         ], // sum revenue from Order
//       ],
//       include: [
//         {
//           model: Product,
//           as: "product",
//           attributes: ["name"],
//         },
//         {
//           model: Order,
//           attributes: [], // we only need totalAmount for aggregation
//         },
//       ],
//       group: ["OrderItem.productId", "product.id"],
//       order: [[sequelize.fn("SUM", sequelize.col("quantity")), "DESC"]],
//       limit: 5,
//       raw: true, // return plain objects instead of Sequelize instances
//       nest: true, // keep included models nested
//     });

//     // format topProducts
//     const formattedTopProducts = topProducts.map((item) => ({
//       productId: item.productId,
//       productName: item.product.name,
//       totalQuantity: parseInt(item.totalQuantity, 10),
//       totalRevenue: parseFloat(item.totalRevenue),
//     }));

//     return res.status(200).json({ topProducts: formattedTopProducts });
//   } catch (error) {
//     console.error("Error fetching order summary:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// Daily revenue report with date filtering
