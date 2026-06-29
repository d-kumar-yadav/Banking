const express= require("express");
const router=express.Router();

const {authMiddleware , sytemusermiddleware}= require("../middleware/auth_middleware");
const {applyLoanController, loanHistoryController, adminLoanReviewController, getAllLoansController, getLoanDetailsController , approveLoanController, rejectLoanController, repayLoanController, precloseLoanController} = require("../controller/loan_controller");

router.post("/apply", authMiddleware, applyLoanController);
router.get("/history", authMiddleware, loanHistoryController);
router.get("/Manager/review", sytemusermiddleware, adminLoanReviewController);
router.get("/Manager/all", sytemusermiddleware, getAllLoansController);
router.get("/Manager/details/:loan_id", sytemusermiddleware, getLoanDetailsController);
router.post("/Manager/approve/:loan_id", sytemusermiddleware, approveLoanController);
router.post("/Manager/reject/:loan_id", sytemusermiddleware, rejectLoanController);
router.post("/repay", authMiddleware, repayLoanController);
router.post("/preclose", authMiddleware, precloseLoanController);



module.exports = router;