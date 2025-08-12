const sequelize = require("./connection");

// Import user module seeders
const seedRoles = require("../../../modules/user/role/seeder");
const seedUsers = require("../../../modules/user/user/seeder");
const seedUserRoles = require("../../../modules/user/userRole/seeder");

// Articles module removed

// Import location module seeders
const seedLocations = require("../../../modules/location/seeder");
// Accounting module seeders
const seedCurrencies = require("../../../modules/currency/seeder");
const seedCustomers = require("../../../modules/customer/seeder");
const seedAccounts = require("../../../modules/account/seeder");
const seedTransactions = require("../../../modules/transaction/seeder");
const seedCompanies = require("../../../modules/company/seeder");
const seedInvoices = require("../../../modules/invoice/seeder");

// Group seeders by module for better organization and control
const userSeeders = [seedRoles, seedUsers, seedUserRoles];

async function runSeederGroup(seeders, groupName) {
  console.log(`\nRunning ${groupName} Seeders...`);
  for (const seeder of seeders) {
    try {
      await seeder();
      console.log(`✅ ${seeder.name} completed successfully`);
    } catch (error) {
      console.error(`❌ Error in ${seeder.name}:`, error);
      throw error; // Re-throw to stop the seeding process
    }
  }
  console.log(`✅ ${groupName} Seeding completed\n`);
}

async function runSeeders() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // 1. Run user module seeders (Roles, Users, UserRoles)
    await runSeederGroup(userSeeders, "User Data");

    // 2. Base dictionaries: currencies
    await runSeederGroup([seedCurrencies], "Currency Data");

    // 3. Master data: companies, customers
    await runSeederGroup([seedCompanies, seedCustomers], "Master Data");

    // 4. Accounts for each customer in base currencies
    await runSeederGroup([seedAccounts], "Accounts Data");

    // 5. Optional: invoices and transactions
    // await runSeederGroup([seedInvoices, seedTransactions], "Transactional Data");

    console.log("\n✅ All database seeding completed successfully!");
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error);
    process.exit(1);
  }
}

module.exports = runSeeders; 