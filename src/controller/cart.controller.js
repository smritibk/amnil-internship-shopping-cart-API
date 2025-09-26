import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Product from "../models/product.model.js";

//add item to cart
export const addItemToCart = async(req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.loggedInUserId;

    // Check if the cart exists for the user
    let cart = await Cart.findOne({ where: { userId } });

    // If not, create a new cart
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // Check if the item is already in the cart
    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });

    if (cartItem) {
      // If it exists, update the quantity
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // If it doesn't exist, create a new cart item
      cartItem = await CartItem.create({ cartId: cart.id, productId, quantity });
    }

    res.status(200).json({ message: "Item added to cart", cartItem });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//view cart items
export const viewCartItems = async(req, res) => {
  try {
    const userId = req.loggedInUserId;
    const cart = await Cart.findOne({ where: { userId } });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    res.status(200).json({ cartItems });
  } catch (error) {
    console.error("Error viewing cart items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//edit cart item
export const editCartItem = async(req, res) => {
  try {
    const { id: cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.loggedInUserId; // Get user ID from the request

    // Find the cart for the user   
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
    }
    // Find the cart item to be updated
    const cartItem = await CartItem.findOne({ where: { id: cartItemId, cartId: cart.id } });
    if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
    }
    // Update the quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: "Cart item updated", cartItem });
    } catch (error) {
    console.error("Error editing cart item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//remove cart item
export const removeCartItem = async(req, res) => {
  try {
    const { id : cartItemId } = req.params;
    const userId = req.loggedInUserId; // Get user ID from the request
    // Find the cart for the user
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
    }
    // Find the cart item to be deleted
    const cartItem = await CartItem.findOne({ where: { id: cartItemId, cartId: cart.id } });
    if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
    }
    // Delete the cart item
    await cartItem.destroy();
    res.status(200).json({ message: "Cart item removed" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
