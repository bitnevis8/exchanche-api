const BaseController = require("../../core/baseController");
const Account = require("./model");
const Customer = require("../customer/model");
const Currency = require("../currency/model");
const Joi = require("joi");

class AccountController extends BaseController {
  constructor() { super(); }

  async getAll(req, res) {
    try {
      const items = await Account.findAll({ include: ['customer', 'currency'], order: [["id", "DESC"]] });
      return this.response(res, 200, true, "لیست حساب‌ها", items);
    } catch (error) { return this.response(res, 500, false, "خطا", null, error); }
  }

  async getOne(req, res) {
    try {
      const item = await Account.findByPk(req.params.id, { include: ['customer', 'currency'] });
      if (!item) return this.response(res, 404, false, 'حساب یافت نشد');
      return this.response(res, 200, true, 'حساب', item);
    } catch (error) { return this.response(res, 500, false, 'خطا', null, error); }
  }

  async getByCustomer(req, res) {
    try {
      const items = await Account.findAll({ where: { customerId: req.params.customerId }, include: ['currency'] });
      return this.response(res, 200, true, "حساب‌های مشتری", items);
    } catch (error) { return this.response(res, 500, false, "خطا", null, error); }
  }

  async create(req, res) {
    const schema = Joi.object({
      customerId: Joi.number().required(),
      currencyCode: Joi.string().required(),
      ownershipType: Joi.string().valid('personal', 'custody').default('custody'),
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);
      const created = await Account.create(value);
      return this.response(res, 201, true, "حساب ایجاد شد", created);
    } catch (err) { return this.response(res, 500, false, "خطا", null, err); }
  }

  async update(req, res) {
    const schema = Joi.object({
      ownershipType: Joi.string().valid('personal', 'custody'),
      isActive: Joi.boolean(),
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);
      const item = await Account.findByPk(req.params.id);
      if (!item) return this.response(res, 404, false, 'حساب یافت نشد');
      await item.update(value);
      return this.response(res, 200, true, 'حساب بروزرسانی شد', item);
    } catch (err) { return this.response(res, 500, false, 'خطا', null, err); }
  }

  async delete(req, res) {
    try {
      const item = await Account.findByPk(req.params.id);
      if (!item) return this.response(res, 404, false, 'حساب یافت نشد');
      if (Number(item.balance) !== 0) {
        return this.response(res, 400, false, 'حذف فقط در صورت صفر بودن مانده امکان‌پذیر است');
      }
      await item.destroy();
      return this.response(res, 200, true, 'حساب حذف شد');
    } catch (err) { return this.response(res, 500, false, 'خطا', null, err); }
  }
}

module.exports = new AccountController();


