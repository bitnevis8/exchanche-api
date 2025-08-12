const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../core/database/mysql/connection");
// Associations are defined centrally in `modules/associations.js`

class Account extends Model {}

Account.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    currencyCode: { type: DataTypes.STRING(8), allowNull: false },
    balance: { type: DataTypes.DECIMAL(24, 8), defaultValue: 0 },
    // personal or custody
    ownershipType: { type: DataTypes.ENUM('personal', 'custody'), defaultValue: 'custody' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Account",
    tableName: "accounts",
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ["customer_id", "currency_code", "ownership_type"] },
    ],
  }
);

module.exports = Account;


