const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../core/database/mysql/connection");

class Customer extends Model {}

Customer.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: false },
    nationalId: { type: DataTypes.STRING(32), allowNull: true },
    mobile: { type: DataTypes.STRING(32), allowNull: true },
    email: { type: DataTypes.STRING(128), allowNull: true },
    idCardImage: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    note: { type: DataTypes.TEXT, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Customer",
    tableName: "customers",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (customer) => {
        if (!customer.fullName && (customer.firstName || customer.lastName)) {
          customer.fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
        }
      },
    },
  }
);

module.exports = Customer;


