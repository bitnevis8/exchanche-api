const BaseController = require("../../core/baseController");
const Invoice = require("./model");
const Account = require("../account/model");
const Transaction = require("../transaction/model");
const Joi = require("joi");

class InvoiceController extends BaseController {
  constructor() { super(); }

  async getAll(req, res) {
    try {
      const items = await Invoice.findAll({ order: [["id","DESC"]] });
      return this.response(res, 200, true, "لیست فاکتورها", items);
    } catch (error) { return this.response(res, 500, false, "خطا", null, error); }
  }

  async getOne(req, res) {
    try {
      const item = await Invoice.findByPk(req.params.id);
      if (!item) return this.response(res, 404, false, "فاکتور یافت نشد");
      return this.response(res, 200, true, "فاکتور", item);
    } catch (error) { return this.response(res, 500, false, "خطا", null, error); }
  }

  async create(req, res) {
    const schema = Joi.object({
      number: Joi.string().required(),
      customerId: Joi.number().required(),
      companyId: Joi.number().required(),
      currencyCode: Joi.string().required(),
      type: Joi.string().valid('sale','purchase','service').required(),
      subtotal: Joi.number().required(),
      vatPercent: Joi.number().precision(2).default(5),
      notes: Joi.string().allow('', null),
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);

      const vatAmount = Number(value.subtotal) * Number(value.vatPercent) / 100;
      const total = Number(value.subtotal) + vatAmount;

      const invoice = await Invoice.create({ ...value, vatAmount, total, status: 'finalized' });

      // Optional: post accounting entry into a customer account in same currency
      const account = await Account.findOne({ where: { customerId: value.customerId, currencyCode: value.currencyCode } });
      if (account) {
        const sign = value.type === 'purchase' ? -1 : 1; // purchase increases payable (credit), sale increases receivable (debit)
        const newBalance = Number(account.balance) + sign * Number(total);
        await account.update({ balance: newBalance });
        await Transaction.create({
          accountId: account.id,
          currencyCode: value.currencyCode,
          type: value.type === 'purchase' ? 'invoice_purchase' : 'invoice_sale',
          description: `Invoice ${invoice.number}`,
          amount: sign * Number(total),
          balanceAfter: newBalance,
          referenceNo: invoice.number,
          valueDate: new Date(),
        });
      }

      return this.response(res, 201, true, 'فاکتور ایجاد شد', invoice);
    } catch (err) { return this.response(res, 500, false, 'خطای ایجاد فاکتور', null, err); }
  }

  async update(req, res) {
    const schema = Joi.object({
      number: Joi.string(),
      customerId: Joi.number(),
      companyId: Joi.number(),
      currencyCode: Joi.string(),
      type: Joi.string().valid('sale','purchase','service'),
      subtotal: Joi.number(),
      vatPercent: Joi.number().precision(2),
      notes: Joi.string().allow('', null),
      status: Joi.string().valid('draft','finalized','paid','cancelled')
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);

      const invoice = await Invoice.findByPk(req.params.id);
      if (!invoice) return this.response(res, 404, false, 'فاکتور یافت نشد');

      // if amounts changed, recalc totals and optionally post adjusting transaction
      const needRecalc = value.subtotal !== undefined || value.vatPercent !== undefined;
      let payload = { ...value };
      if (needRecalc) {
        const subtotal = value.subtotal !== undefined ? Number(value.subtotal) : Number(invoice.subtotal);
        const vatPercent = value.vatPercent !== undefined ? Number(value.vatPercent) : Number(invoice.vatPercent);
        const vatAmount = subtotal * vatPercent / 100;
        const total = subtotal + vatAmount;
        payload = { ...payload, subtotal, vatPercent, vatAmount, total };
      }

      await invoice.update(payload);
      return this.response(res, 200, true, 'فاکتور بروزرسانی شد', invoice);
    } catch (err) { return this.response(res, 500, false, 'خطای بروزرسانی فاکتور', null, err); }
  }

  async delete(req, res) {
    try {
      const invoice = await Invoice.findByPk(req.params.id);
      if (!invoice) return this.response(res, 404, false, 'فاکتور یافت نشد');
      // Optionally: reverse related transaction(s) if any – skipped for simplicity
      await invoice.destroy();
      return this.response(res, 200, true, 'فاکتور حذف شد');
    } catch (err) { return this.response(res, 500, false, 'خطای حذف فاکتور', null, err); }
  }
}

module.exports = new InvoiceController();


