const User = require("../user/model");
const Role = require("../role/model");
const UserRole = require("./model");
const seederData = require("./seederData.json");

const seedUserRoles = async () => {
  try {
    await UserRole.bulkCreate(seederData, {
      ignoreDuplicates: true, // برای جلوگیری از خطای تکراری شدن کلید اصلی در صورت وجود رکورد از قبل
    });
    console.log("User roles seeded successfully!");
  } catch (error) {
    console.error("Error seeding user roles:", error);
  }
};

module.exports = seedUserRoles; 