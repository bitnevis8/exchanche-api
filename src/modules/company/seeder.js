const Company = require('./model');
const data = require('./seederData.json');

module.exports = async function seedCompanies() {
  for (const item of data) {
    await Company.findOrCreate({ where: { name: item.name }, defaults: item });
  }
};


