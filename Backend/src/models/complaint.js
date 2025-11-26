const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Complaint = sequelize.define("Complaint", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending", // pending, resolved
  },
});

// Relation: a user can have many complaints
User.hasMany(Complaint, { foreignKey: "userId" });
Complaint.belongsTo(User, { foreignKey: "userId" });

module.exports = Complaint;
