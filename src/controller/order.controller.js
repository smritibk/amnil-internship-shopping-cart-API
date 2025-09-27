import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import Product from "../models/product.model.js";

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
