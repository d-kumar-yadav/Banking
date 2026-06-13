const express= require("express");
const router=express.Router();

const {authMiddleware , sytemusermiddleware}= require("../middleware/auth_middleware");
const {applyLoanController, loanHistoryController, adminLoanReviewController, getAllLoansController, getLoanDetailsController , approveLoanController, rejectLoanController} = require("../controller/loan_controller");

router.post("/apply", authMiddleware, applyLoanController);
router.get("/history", authMiddleware, loanHistoryController);
router.get("/admin/review", sytemusermiddleware, adminLoanReviewController);
router.get("/admin/all", sytemusermiddleware, getAllLoansController);
router.get("/admin/details/:loan_id", sytemusermiddleware, getLoanDetailsController);
router.post("/admin/approve/:loan_id", sytemusermiddleware, approveLoanController);
router.post("/admin/reject/:loan_id", sytemusermiddleware, rejectLoanController);



module.exports = router;