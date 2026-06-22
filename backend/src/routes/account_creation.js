const express = require("express");

const router = express.Router();
const { createaccount, getallaccount, getbalance, approveAccount, rejectAccount, approvefrozenaccount, getflaggedtransactions, getaccountdetails, getappliedaccounts, getallpendingaccounts } = require("../controller/account_controller_creation");
const { authMiddleware, managermiddleware } = require("../middleware/auth_middleware");

router.post("/user/createaccount", authMiddleware, createaccount);
//  get all the account associated with that user
router.get("/user/getallaccount", authMiddleware, getallaccount);

// GET balance of user
router.get("/user/balance/:accountNumber", authMiddleware, getbalance)
// get applied accounts
router.get("/user/appliedaccounts", authMiddleware, getappliedaccounts);





router.post("/Manager/approve-account/:userId/:refrencenumber", managermiddleware, approveAccount);
router.post("/Manager/reject-account/:userId/:refrencenumber", managermiddleware, rejectAccount);
router.post("/Manager/approve-frozen-account", managermiddleware  , approvefrozenaccount);

router.get("/Manager/pending-accounts", managermiddleware, getallpendingaccounts);
router.get("/Manager/flagged-transactions/:accountNumber", managermiddleware, getflaggedtransactions);
router.get("/Manager/accountdetails/:accountNumber", managermiddleware, getaccountdetails);


module.exports = router;