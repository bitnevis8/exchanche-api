const express = require("express");
const baseRouter = express.Router();

// Import routers
const userRouter = require('../modules/user/route');
const authRouter = require('../modules/user/auth/route');
const roleRouter = require('../modules/user/role/route');
const fileUploadRouter = require('../modules/fileUpload/route');
const locationRouter = require('../modules/location/route');
// New accounting-related modules
const currencyRouter = require('../modules/currency/route');
const customerRouter = require('../modules/customer/route');
const accountRouter = require('../modules/account/route');
const transactionRouter = require('../modules/transaction/route');
const companyRouter = require('../modules/company/route');
const invoiceRouter = require('../modules/invoice/route');

// Use routers
baseRouter.use('/user', userRouter);
baseRouter.use('/user/auth', authRouter);
baseRouter.use('/user/role', roleRouter);
baseRouter.use('/file-upload', fileUploadRouter);
baseRouter.use('/location', locationRouter);
// Mount new modules
baseRouter.use('/currency', currencyRouter);
baseRouter.use('/customer', customerRouter);
baseRouter.use('/account', accountRouter);
baseRouter.use('/transaction', transactionRouter);
baseRouter.use('/company', companyRouter);
baseRouter.use('/invoice', invoiceRouter);

module.exports = baseRouter;
