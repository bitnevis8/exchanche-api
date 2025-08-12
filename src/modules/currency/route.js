const express = require("express");
const controller = require("./controller");

const router = express.Router();

router.get("/getAll", controller.getAll);
router.get("/getOne/:code", controller.getOne);
router.post("/create", controller.create);
router.put("/update/:code", controller.update);
router.delete("/delete/:code", controller.delete);

module.exports = router;


