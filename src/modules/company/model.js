const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../core/database/mysql/connection");

class Company extends Model {}

Company.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    nameEn: { type: DataTypes.STRING, allowNull: true },
    taxId: { type: DataTypes.STRING(64), allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING(64), allowNull: true },
    email: { type: DataTypes.STRING(128), allowNull: true },
    logo: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Company",
    tableName: "companies",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Company;


