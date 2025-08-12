const express = require("express");
const controller = require("./controller");

const router = express.Router();

router.get("/getAll", controller.getAll);
router.get("/getOne/:id", controller.getOne);
router.get("/byCustomer/:customerId", controller.getByCustomer);
router.post("/create", controller.create);
router.put("/update/:id", controller.update);
router.delete("/delete/:id", controller.delete);

module.exports = router;


