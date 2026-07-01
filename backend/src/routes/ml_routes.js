const express = require("express");
const router = express.Router();
const { simulateCreditScore } = require("../ml_service/credit_service");
const {authMiddleware} = require("../middleware/auth_middleware");


router.post("/simulate", authMiddleware, simulateCreditScore); 


module.exports = router;