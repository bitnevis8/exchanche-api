const BaseController = require("../../core/baseController");
const Company = require("./model");
const Joi = require("joi");

class CompanyController extends BaseController {
  constructor() { super(); }

  async getAll(req, res) {
    try {
      const items = await Company.findAll({ order: [["id","DESC"]] });
      return this.response(res, 200, true, "لیست شرکت‌ها", items);
    } catch (error) { return this.response(res, 500, false, "خطا", null, error); }
  }

  async getOne(req, res) {
    try {
      const item = await Company.findByPk(req.params.id);
      if (!item) return this.response(res, 404, false, "شرکت یافت نشد");
      return this.response(res, 200, true, "شرکت", item);
    } catch (error) { return this.response(res, 500, false, "خطا", null, error); }
  }

  async create(req, res) {
    const schema = Joi.object({
      name: Joi.string().required(),
      nameEn: Joi.string().allow('', null),
      taxId: Joi.string().allow('', null),
      address: Joi.string().allow('', null),
      phone: Joi.string().allow('', null),
      email: Joi.string().email().allow('', null),
      logo: Joi.string().allow('', null),
      isActive: Joi.boolean().default(true),
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);
      const created = await Company.create(value);
      return this.response(res, 201, true, "شرکت ایجاد شد", created);
    } catch (err) { return this.response(res, 500, false, "خطا", null, err); }
  }

  async update(req, res) {
    const schema = Joi.object({
      name: Joi.string(),
      nameEn: Joi.string().allow('', null),
      taxId: Joi.string().allow('', null),
      address: Joi.string().allow('', null),
      phone: Joi.string().allow('', null),
      email: Joi.string().email().allow('', null),
      logo: Joi.string().allow('', null),
      isActive: Joi.boolean(),
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);
      const item = await Company.findByPk(req.params.id);
      if (!item) return this.response(res, 404, false, "شرکت یافت نشد");
      await item.update(value);
      return this.response(res, 200, true, "شرکت بروزرسانی شد", item);
    } catch (err) { return this.response(res, 500, false, "خطا", null, err); }
  }

  async delete(req, res) {
    try {
      const item = await Company.findByPk(req.params.id);
      if (!item) return this.response(res, 404, false, "شرکت یافت نشد");
      await item.destroy();
      return this.response(res, 200, true, "شرکت حذف شد");
    } catch (err) { return this.response(res, 500, false, "خطا", null, err); }
  }
}

module.exports = new CompanyController();


