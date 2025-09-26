import { DataTypes } from "sequelize";
import sequelize from "../config/db.configuration.js";
import Cart from "./cart.model.js";
import Product from "./product.model.js";


const CartItem = sequelize.define("CartItem", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
});

CartItem.belongsTo(Cart, { foreignKey: "cartId", as: "cart" });
Cart.hasMany(CartItem, { foreignKey: "cartId", as: "items" });

CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(CartItem, { foreignKey: "productId", as: "cartItems" });

export default CartItem;