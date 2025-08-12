const BaseController = require("../../core/baseController");
const Currency = require("./model");
const Joi = require("joi");

class CurrencyController extends BaseController {
  constructor() {
    super();
  }

  async getAll(req, res) {
    try {
      const items = await Currency.findAll({ order: [["code", "ASC"]] });
      return this.response(res, 200, true, "لیست ارزها", items);
    } catch (error) {
      return this.response(res, 500, false, "خطا در دریافت ارزها", null, error);
    }
  }

  async getOne(req, res) {
    try {
      const item = await Currency.findByPk(req.params.code);
      if (!item) return this.response(res, 404, false, "ارز یافت نشد");
      return this.response(res, 200, true, "ارز", item);
    } catch (error) {
      return this.response(res, 500, false, "خطا در دریافت ارز", null, error);
    }
  }

  async create(req, res) {
    const schema = Joi.object({
      code: Joi.string().uppercase().max(8).required(),
      name: Joi.string().required(),
      symbol: Joi.string().max(8).allow(null, ""),
      isBase: Joi.boolean().default(false),
      rateToAED: Joi.number().precision(8).allow(null),
      rateToUSD: Joi.number().precision(8).allow(null),
      rateToIRR: Joi.number().precision(8).allow(null),
      enabled: Joi.boolean().default(true),
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);
      const created = await Currency.create(value);
      return this.response(res, 201, true, "ارز ایجاد شد", created);
    } catch (err) {
      return this.response(res, 500, false, "خطا در ایجاد ارز", null, err);
    }
  }

  async update(req, res) {
    const schema = Joi.object({
      name: Joi.string(),
      symbol: Joi.string().max(8).allow(null, ""),
      isBase: Joi.boolean(),
      rateToAED: Joi.number().precision(8).allow(null),
      rateToUSD: Joi.number().precision(8).allow(null),
      rateToIRR: Joi.number().precision(8).allow(null),
      enabled: Joi.boolean(),
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);
      const item = await Currency.findByPk(req.params.code);
      if (!item) return this.response(res, 404, false, "ارز یافت نشد");
      await item.update(value);
      return this.response(res, 200, true, "ارز بروزرسانی شد", item);
    } catch (err) {
      return this.response(res, 500, false, "خطا در بروزرسانی ارز", null, err);
    }
  }

  async delete(req, res) {
    try {
      const item = await Currency.findByPk(req.params.code);
      if (!item) return this.response(res, 404, false, "ارز یافت نشد");
      await item.destroy();
      return this.response(res, 200, true, "ارز حذف شد");
    } catch (err) {
      return this.response(res, 500, false, "خطا در حذف ارز", null, err);
    }
  }
}

module.exports = new CurrencyController();


