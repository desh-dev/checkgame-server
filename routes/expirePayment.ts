import express from "express";
const router = express.Router();
const fapshiController = require("../controllers/fapshiController");

router.post("/", fapshiController.expirePay);

module.exports = router;