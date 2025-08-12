const express = require("express");
const controller = require("./controller");
const { authenticateUser, authorizeRole } = require("../user/auth/middleware");

const router = express.Router();

router.get("/getAll", controller.getAll);
router.get("/getOne/:id", controller.getOne);
router.post("/create", controller.create);
router.put("/update/:id", controller.update);
router.delete("/delete/:id", controller.delete);
router.get("/statement/:accountId", controller.getStatement);
router.get("/statement/:accountId/pdf", controller.getStatementPdf);
router.post("/approve/:id", authenticateUser, authorizeRole('Admin'), controller.approve);
router.post("/statement/:accountId/pdf/send", controller.emailStatementPdf);
router.post("/year-close/:customerId", authenticateUser, authorizeRole('Admin'), controller.yearCloseCustomer);

module.exports = router;


