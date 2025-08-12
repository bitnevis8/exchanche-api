const User = require('./user/user/model');
const Role = require('./user/role/model');
const UserRole = require('./user/userRole/model');
// const { MissionOrder, MissionCompanion } = require('./aryafoulad/missionOrder/model');
const FileUpload = require('./fileUpload/model');
// const Item = require('./aryafoulad/warehouseModule/item/model');
// const Inventory = require('./aryafoulad/warehouseModule/inventory/model');
// const Warehouse = require('./aryafoulad/warehouseModule/warehouse/model');
// const StockHistory = require('./aryafoulad/warehouseModule/stockHistory/model');
// const ItemAssignment = require('./aryafoulad/warehouseModule/itemAssignment/model');

// Articles module removed

// Import مدل‌های ماژول location
const Location = require('./location/model');
// Accounting models
const Currency = require('./currency/model');
const Customer = require('./customer/model');
const Account = require('./account/model');
const Transaction = require('./transaction/model');
const Company = require('./company/model');
const Invoice = require('./invoice/model');

// تعریف ارتباطات بین مدل‌ها
const defineAssociations = () => {
    // ارتباطات مربوط به کاربران و نقش‌ها
    // User.belongsTo(Role, { 
    //     foreignKey: "roleId", 
    //     as: "role",
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });
    // Role.hasMany(User, { 
    //     foreignKey: "roleId", 
    //     as: "users" 
    // });

    // ارتباطات Many-to-Many بین User و Role
    User.belongsToMany(Role, {
        through: UserRole,
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'userRoles',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Role.belongsToMany(User, {
        through: UserRole,
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'roleUsers',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    // ارتباطات مربوط به ماموریت‌ها
    // MissionOrder.belongsTo(User, { 
    //     foreignKey: 'userId', 
    //     as: 'user',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });
    // MissionOrder.belongsToMany(User, { 
    //     through: MissionCompanion, 
    //     as: 'missionCompanions',
    //     foreignKey: 'missionOrderId',
    //     otherKey: 'userId',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });
    // User.belongsToMany(MissionOrder, { 
    //     through: MissionCompanion, 
    //     as: 'missions',
    //     foreignKey: 'userId',
    //     otherKey: 'missionOrderId',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به فایل‌ها
    // MissionOrder.hasMany(FileUpload, {
    //     foreignKey: 'missionOrderId',
    //     as: 'files',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });
    // FileUpload.belongsTo(MissionOrder, {
    //     foreignKey: 'missionOrderId',
    //     as: 'missionOrder',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به انبار
    // Warehouse.hasMany(Inventory, { 
    //     foreignKey: 'warehouseId', 
    //     as: 'inventories',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });
    // Inventory.belongsTo(Warehouse, { 
    //     foreignKey: 'warehouseId', 
    //     as: 'warehouse',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به کالا
    // Item.hasMany(Inventory, { 
    //     foreignKey: 'itemId', 
    //     as: 'inventories',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });
    // Inventory.belongsTo(Item, { 
    //     foreignKey: 'itemId', 
    //     as: 'item',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به تخصیص کالا
    // Item.hasMany(ItemAssignment, { 
    //     foreignKey: 'itemId', 
    //     as: 'assignments',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });
    // ItemAssignment.belongsTo(Item, { 
    //     foreignKey: 'itemId', 
    //     as: 'assignedItem',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به تاریخچه موجودی
    // Inventory.hasMany(StockHistory, { 
    //     foreignKey: 'inventoryId', 
    //     as: 'stockHistory',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });
    // StockHistory.belongsTo(Inventory, { 
    //     foreignKey: 'inventoryId', 
    //     as: 'inventory',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به تخصیص و کاربر
    // ItemAssignment.belongsTo(User, { 
    //     foreignKey: 'userId', 
    //     as: 'assignedUser',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });

    // ===== Articles associations removed =====

    // ===== ارتباطات ماژول Location =====
    
    // ارتباطات سلسله‌مراتبی Location (self-referencing)
    Location.hasMany(Location, { 
        foreignKey: 'parentId', 
        as: 'children',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });
    Location.belongsTo(Location, { 
        foreignKey: 'parentId', 
        as: 'parent',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });

    // ===== Accounting associations =====
    // Customer has many Accounts
    Customer.hasMany(Account, { foreignKey: 'customerId', as: 'accounts', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Account.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

    // Currency relations for accounts/transactions/invoices
    Account.belongsTo(Currency, { foreignKey: 'currencyCode', targetKey: 'code', as: 'currency', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

    // Account has many Transactions
    Account.hasMany(Transaction, { foreignKey: 'accountId', as: 'transactions', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Transaction.belongsTo(Account, { foreignKey: 'accountId', as: 'account', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Transaction.belongsTo(Currency, { foreignKey: 'currencyCode', targetKey: 'code', as: 'currency', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

    // Company has many Invoices
    Company.hasMany(Invoice, { foreignKey: 'companyId', as: 'invoices', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Invoice.belongsTo(Company, { foreignKey: 'companyId', as: 'company', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

    // Customer has many Invoices
    Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Invoice.belongsTo(Currency, { foreignKey: 'currencyCode', targetKey: 'code', as: 'currency', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
};

module.exports = defineAssociations; 