const BaseController = require("../../core/baseController");
const Account = require("../account/model");
const Transaction = require("./model");
const Currency = require("../currency/model");
const PDFDocument = require('pdfkit');
const Joi = require("joi");

async function getRates() {
  const currencies = await Currency.findAll();
  const map = new Map();
  for (const c of currencies) map.set(c.code, c.toJSON());
  return map;
}

function convertAmount(amount, from, to) {
  if (from === to) return amount;
  // convert via USD if direct rate missing
  const fromToUSD = from === 'USD' ? 1 : Number(from.rateToUSD || 0);
  const usdToTarget = to === 'USD' ? 1 : 1 / Number(to.rateToUSD || 0);
  return Number(amount) * fromToUSD * usdToTarget;
}

class TransactionController extends BaseController {
  constructor() { super(); }

  async getAll(req, res) {
    try {
      const items = await Transaction.findAll({ include: ['account', 'currency'], order: [["id","DESC"]] });
      return this.response(res, 200, true, "لیست تراکنش‌ها", items);
    } catch (error) { return this.response(res, 500, false, "خطا", null, error); }
  }

  async getOne(req, res) {
    try {
      const item = await Transaction.findByPk(req.params.id, { include: ['account', 'currency'] });
      if (!item) return this.response(res, 404, false, 'تراکنش یافت نشد');
      return this.response(res, 200, true, 'تراکنش', item);
    } catch (error) { return this.response(res, 500, false, 'خطا', null, error); }
  }

  async getStatement(req, res) {
    try {
      const accountId = parseInt(req.params.accountId, 10);
      const limit = parseInt(req.query.limit || '100', 10);
      const offset = parseInt(req.query.offset || '0', 10);

      const account = await Account.findByPk(accountId);
      if (!account) return this.response(res, 404, false, 'حساب یافت نشد');

      const txs = await Transaction.findAll({
        where: { accountId },
        order: [["id", "ASC"]],
        limit,
        offset,
      });

      let running = 0;
      const rows = txs.map((t, idx) => {
        running = Number(t.balanceAfter); // persisted running balance
        const debit = Number(t.amount) > 0 ? Number(t.amount) : 0;
        const credit = Number(t.amount) < 0 ? -Number(t.amount) : 0;
        return {
          row: offset + idx + 1,
          description: t.description || t.type,
          type: t.type,
          debit,
          credit,
          balance: running,
          valueDate: t.valueDate,
          status: t.requiresManagerApproval ? 'pending' : 'applied',
        };
      });

      return this.response(res, 200, true, 'صورت‌حساب', {
        accountId: account.id,
        currencyCode: account.currencyCode,
        ownershipType: account.ownershipType,
        rows,
      });
    } catch (error) {
      return this.response(res, 500, false, 'خطا در دریافت صورت‌حساب', null, error);
    }
  }

  async getStatementPdf(req, res) {
    try {
      const accountId = parseInt(req.params.accountId, 10);
      const limit = parseInt(req.query.limit || '100', 10);
      const offset = parseInt(req.query.offset || '0', 10);

      const account = await Account.findByPk(accountId);
      if (!account) return this.response(res, 404, false, 'حساب یافت نشد');

      const txs = await Transaction.findAll({
        where: { accountId },
        order: [["id", "ASC"]],
        limit,
        offset,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="statement-${accountId}.pdf"`);

      const doc = new PDFDocument({ margin: 36, size: 'A4' });
      doc.pipe(res);

      doc.fontSize(16).text(`صورت‌حساب حساب ${accountId} - ارز ${account.currencyCode}`, { align: 'right' });
      doc.moveDown();

      // Header row
      doc.fontSize(10);
      const header = ['ردیف', 'توضیحات', 'نوع', 'بدهکار', 'بستانکار', 'مانده', 'تاریخ', 'وضعیت'];
      doc.text(header.join(' | '), { align: 'right' });
      doc.moveDown(0.5);

      txs.forEach((t, idx) => {
        const debit = Number(t.amount) > 0 ? Number(t.amount) : 0;
        const credit = Number(t.amount) < 0 ? -Number(t.amount) : 0;
        const row = [
          String(offset + idx + 1),
          t.description || t.type,
          t.type,
          debit.toFixed(4),
          credit.toFixed(4),
          Number(t.balanceAfter).toFixed(4),
          new Date(t.valueDate).toISOString().slice(0,10),
          t.requiresManagerApproval ? 'در انتظار' : 'ثبت شده',
        ];
        doc.text(row.join(' | '), { align: 'right' });
      });

      doc.end();
    } catch (error) {
      return this.response(res, 500, false, 'خطا در تولید PDF', null, error);
    }
  }

  async approve(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const tx = await Transaction.findByPk(id);
      if (!tx) return this.response(res, 404, false, 'تراکنش یافت نشد');
      if (!tx.requiresManagerApproval) return this.response(res, 400, false, 'این تراکنش نیازی به تایید ندارد');

      const account = await Account.findByPk(tx.accountId);
      if (!account) return this.response(res, 404, false, 'حساب یافت نشد');

      const newBalance = Number(account.balance) + Number(tx.amount);
      await account.update({ balance: newBalance });
      await tx.update({ requiresManagerApproval: false, balanceAfter: newBalance, approvedByUserId: req.user?.userId || null });

      return this.response(res, 200, true, 'تراکنش تایید و اعمال شد', tx);
    } catch (error) {
      return this.response(res, 500, false, 'خطا در تایید تراکنش', null, error);
    }
  }
  async create(req, res) {
    const schema = Joi.object({
      accountId: Joi.number().required(),
      currencyCode: Joi.string().required(),
      type: Joi.string().valid('buy','sell','deposit_cash','withdraw_cash','remittance_in','remittance_out','invoice_sale','invoice_purchase').required(),
      description: Joi.string().allow('', null),
      amount: Joi.number().required(), // positive debit, negative credit
      requireApprovalIfInsufficient: Joi.boolean().default(true),
      referenceNo: Joi.string().allow('', null),
      valueDate: Joi.date().optional(),
    });

    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);

      const account = await Account.findByPk(value.accountId);
      if (!account) return this.response(res, 404, false, 'حساب یافت نشد');
      if (account.currencyCode !== value.currencyCode) return this.response(res, 400, false, 'کد ارز با حساب همخوان نیست');

      // Inventory check: do not allow negative balance unless approval is required
      const currentBalance = Number(account.balance);
      const tentativeBalance = currentBalance + Number(value.amount);
      const requiresManagerApproval = tentativeBalance < 0 && value.requireApprovalIfInsufficient;

      let balanceAfter = currentBalance;
      if (!requiresManagerApproval) {
        balanceAfter = tentativeBalance;
        await account.update({ balance: balanceAfter });
      }

      const tx = await Transaction.create({
        accountId: account.id,
        currencyCode: value.currencyCode,
        type: value.type,
        description: value.description || null,
        amount: value.amount,
        balanceAfter,
        requiresManagerApproval,
        referenceNo: value.referenceNo || null,
        valueDate: value.valueDate || new Date(),
      });

      return this.response(res, 201, true, 'تراکنش ثبت شد', tx);
    } catch (err) {
      return this.response(res, 500, false, 'خطای ثبت تراکنش', null, err);
    }
  }

  async update(req, res) {
    const schema = Joi.object({
      description: Joi.string().allow('', null),
      referenceNo: Joi.string().allow('', null),
      valueDate: Joi.date(),
    });
    try {
      const { value, error } = schema.validate(req.body);
      if (error) return this.response(res, 400, false, error.details[0].message);
      const tx = await Transaction.findByPk(req.params.id);
      if (!tx) return this.response(res, 404, false, 'تراکنش یافت نشد');
      if (!tx.requiresManagerApproval) {
        // Only metadata updates allowed after apply
        const allowed = { description: value.description, referenceNo: value.referenceNo, valueDate: value.valueDate };
        await tx.update(allowed);
      } else {
        await tx.update(value);
      }
      return this.response(res, 200, true, 'تراکنش بروزرسانی شد', tx);
    } catch (err) { return this.response(res, 500, false, 'خطای بروزرسانی تراکنش', null, err); }
  }

  async delete(req, res) {
    try {
      const tx = await Transaction.findByPk(req.params.id);
      if (!tx) return this.response(res, 404, false, 'تراکنش یافت نشد');
      if (!tx.requiresManagerApproval) return this.response(res, 400, false, 'حذف تراکنش ثبت‌شده مجاز نیست');
      await tx.destroy();
      return this.response(res, 200, true, 'تراکنش حذف شد');
    } catch (err) { return this.response(res, 500, false, 'خطای حذف تراکنش', null, err); }
  }
}

module.exports = new TransactionController();


