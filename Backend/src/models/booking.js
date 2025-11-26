const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Booking = sequelize.define("Booking", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fromCity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  toCity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  travelDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  travelMode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  operator: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  passengers: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  discountType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "regular",
  },
  isRoundTrip: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  returnDate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  returnTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  returnOperator: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  returnSeatNumbers: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  returnPnrNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  returnBerthAllocated: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  returnClassCoach: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'bookings', // Use existing 'bookings' table
  timestamps: true
});

// Relation: a user can have many bookings
User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

module.exports = Booking;
