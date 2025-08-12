const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../core/database/mysql/connection");
// Associations defined in `modules/associations.js`

class Transaction extends Model {}

Transaction.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    currencyCode: { type: DataTypes.STRING(8), allowNull: false },
    // type: buy, sell, deposit_cash, withdraw_cash, remittance_in, remittance_out, invoice_sale, invoice_purchase
    type: { 
      type: DataTypes.ENUM('buy','sell','deposit_cash','withdraw_cash','remittance_in','remittance_out','invoice_sale','invoice_purchase','year_close','year_open'), 
      allowNull: false 
    },
    description: { type: DataTypes.STRING, allowNull: true },
    // positive for debit, negative for credit in the account currency
    amount: { type: DataTypes.DECIMAL(24,8), allowNull: false },
    // balance snapshot after this transaction
    balanceAfter: { type: DataTypes.DECIMAL(24,8), allowNull: false },
    requiresManagerApproval: { type: DataTypes.BOOLEAN, defaultValue: false },
    approvedByUserId: { type: DataTypes.INTEGER, allowNull: true },
    referenceNo: { type: DataTypes.STRING(64), allowNull: true },
    valueDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "transactions",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Transaction;


