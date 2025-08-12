const Currency = require('./model');
const data = require('./seederData.json');

module.exports = async function seedCurrencies() {
  for (const item of data) {
    await Currency.upsert(item);
  }
};


