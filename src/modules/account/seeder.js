const Account = require('./model');
const Customer = require('../customer/model');

module.exports = async function seedAccounts() {
  const customers = await Customer.findAll();
  for (const customer of customers) {
    for (const currencyCode of ['AED', 'USD', 'IRR']) {
      await Account.findOrCreate({
        where: { customerId: customer.id, currencyCode, ownershipType: 'custody' },
        defaults: { balance: 0 },
      });
    }
  }
};


