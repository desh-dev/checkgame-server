import express from "express";
const router = express.Router();
const fapshiController = require("../controllers/fapshiController");

router.post("/", fapshiController.directPay);

module.exports = router;