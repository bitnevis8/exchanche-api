const Customer = require('./model');
const data = require('./seederData.json');

module.exports = async function seedCustomers() {
  for (const item of data) {
    await Customer.findOrCreate({ where: { code: item.code }, defaults: item });
  }
};


