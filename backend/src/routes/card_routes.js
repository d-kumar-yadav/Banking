const express = require("express");
const router = express.Router();
const cardController = require("../controller/card_controller");
const { authMiddleware, managermiddleware } = require("../middleware/auth_middleware");

// User Routes
router.post("/apply", authMiddleware, cardController.applyCard);
router.get("/history", authMiddleware, cardController.getHistory);

// Manager Routes
router.get("/pending", managermiddleware, cardController.getPendingApplications);
router.post("/approve/:applicationId", managermiddleware, cardController.approveApplication);
router.post("/reject/:applicationId", managermiddleware, cardController.rejectApplication);

module.exports = router;
