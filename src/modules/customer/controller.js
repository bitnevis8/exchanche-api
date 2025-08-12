const BaseController = require("../../core/baseController");
const Customer = require("./model");
const Joi = require("joi");

class CustomerController extends BaseController {
  constructor() { super(); }

  async getAll(req, res) {
    try {
      const items = await Customer.findAll({ order: [["id", "DESC"]] });
      return this.response(res, 200, true, "لیست مشتریان", items);
    } catch (error) { return this.response(res, 500, false, "خطا در دریافت", null, error); }
  }

  async getOne(req, res) {
    try {
      const item = await Customer.findByPk(req.params.id);
      if (!item) return this.response(res, 404, false, "مشتری یافت نشد");
      return this.response(res, 200, true, "مشتری", item);
    } catch (error) { return this.response(res, 500, false, "خطا", null, error); }
  }

  async create(req, res) {
    const schema = Joi.object({
      code: Joi.string().max(32).required(),
      firstName: Joi.string().allow('', null),
      lastName: Joi.string().allow('', null),
      nationalId: Joi.string().allow(null, ''),
      mobile: Joi.string().allow(null, ''),
      email: Joi.alternatives().try(
        Joi.string().email({ tlds: { allow: false } }),
        Joi.valid('', null)
      ),
      idCardImage: Joi.string().allow(null, ''),
      address: Joi.string().allow(null, ''),
      note: Joi.string().allow(null, ''),
      isActive: Joi.boolean().default(true),
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);
      if (!value.firstName && !value.lastName) {
        return this.response(res, 400, false, 'حداقل یکی از فیلدهای نام یا نام خانوادگی باید پر شود');
      }
      const created = await Customer.create(value);
      return this.response(res, 201, true, 'مشتری ایجاد شد', created);
    } catch (err) { return this.response(res, 500, false, 'خطا', null, err); }
  }

  async update(req, res) {
    const schema = Joi.object({
      code: Joi.string().max(32),
      firstName: Joi.string(),
      lastName: Joi.string(),
      nationalId: Joi.string().allow(null, ""),
      mobile: Joi.string().allow(null, ""),
      email: Joi.string().email().allow(null, ""),
      idCardImage: Joi.string().allow(null, ""),
      address: Joi.string().allow(null, ""),
      note: Joi.string().allow(null, ""),
      isActive: Joi.boolean(),
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);
      const item = await Customer.findByPk(req.params.id);
      if (!item) return this.response(res, 404, false, "مشتری یافت نشد");
      await item.update(value);
      return this.response(res, 200, true, "مشتری بروزرسانی شد", item);
    } catch (err) { return this.response(res, 500, false, "خطا", null, err); }
  }

  async delete(req, res) {
    try {
      const item = await Customer.findByPk(req.params.id);
      if (!item) return this.response(res, 404, false, "مشتری یافت نشد");
      await item.destroy();
      return this.response(res, 200, true, "مشتری حذف شد");
    } catch (err) { return this.response(res, 500, false, "خطا", null, err); }
  }
}

module.exports = new CustomerController();


