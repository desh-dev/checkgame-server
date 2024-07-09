import express from "express";
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/", paymentController.requestToPay);

module.exports = router;