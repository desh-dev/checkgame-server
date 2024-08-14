import express from "express";
const router = express.Router();
const paymentController = require("../controllers/monetbilController");

router.post("/", paymentController.monetbilPayment);

module.exports = router;