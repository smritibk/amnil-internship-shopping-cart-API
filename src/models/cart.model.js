import sequelize from "../config/db.configuration.js";
import { DataTypes } from "sequelize";
import User from "./user.model.js";

const Cart = sequelize.define("Cart", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
});

Cart.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(Cart, { foreignKey: "userId", as: "cart" });

export default Cart;
