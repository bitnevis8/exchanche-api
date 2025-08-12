const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../core/database/mysql/connection");
// Associations defined in `modules/associations.js`

class Invoice extends Model {}

Invoice.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    number: { type: DataTypes.STRING(64), unique: true, allowNull: false },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    companyId: { type: DataTypes.INTEGER, allowNull: false },
    currencyCode: { type: DataTypes.STRING(8), allowNull: false },
    type: { type: DataTypes.ENUM('sale','purchase','service'), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(24,8), allowNull: false },
    vatPercent: { type: DataTypes.DECIMAL(5,2), defaultValue: 5.0 },
    vatAmount: { type: DataTypes.DECIMAL(24,8), allowNull: false },
    total: { type: DataTypes.DECIMAL(24,8), allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('draft','finalized','paid','cancelled'), defaultValue: 'draft' },
    issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Invoice",
    tableName: "invoices",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Invoice;


