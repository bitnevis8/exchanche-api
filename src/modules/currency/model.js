const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../core/database/mysql/connection");

class Currency extends Model {}

Currency.init(
  {
    // Use currency code as primary key (e.g., AED, USD, IRR, CNY)
    code: { type: DataTypes.STRING(8), primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    symbol: { type: DataTypes.STRING(8), allowNull: true },
    isBase: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Conversion rates to base currencies; nullable for bases
    rateToAED: { type: DataTypes.DECIMAL(18, 8), allowNull: true },
    rateToUSD: { type: DataTypes.DECIMAL(18, 8), allowNull: true },
    rateToIRR: { type: DataTypes.DECIMAL(18, 8), allowNull: true },
    enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Currency",
    tableName: "currencies",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Currency;


