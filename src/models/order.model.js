import { DataTypes } from "sequelize";
import sequelize from "../config/db.configuration.js";
import User from "./user.model.js";
import OrderItem from "./orderItem.model.js";

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "paid", "shipped", "delivered"),
    defaultValue: "pending",
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

// Defining Relationships

Order.belongsTo(User, { foreignKey: "userId", as: "customer" });
User.hasMany(Order, { foreignKey: "userId", as: "orders" });

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

export default Order;
