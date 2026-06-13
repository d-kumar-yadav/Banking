const express= require("express");
const router= express.Router();

 const {authMiddleware,sytemusermiddleware}= require("../middleware/auth_middleware");
 const {transactioncontroller, intialfundcontroller , transaction_history }= require("../controller/transaction_controller");


router.post("/transaction",authMiddleware,transactioncontroller);

router.get("/transaction_history/:accountNumber" , authMiddleware,transaction_history)

// intial fund api
router.post("/system/intial_fund"  ,sytemusermiddleware,  intialfundcontroller)

module.exports= router;