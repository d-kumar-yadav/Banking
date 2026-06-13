const express = require("express");

const router = express.Router();
const { createaccount, getallaccount, getbalance, approveAccount, rejectAccount, approvefrozenaccount, getflaggedtransactions, getaccountdetails, getappliedaccounts, getallpendingaccounts } = require("../controller/account_controller_creation");
const { authMiddleware, sytemusermiddleware } = require("../middleware/auth_middleware");

router.post("/createaccount", authMiddleware, createaccount);
//  get all the account associated with that user
router.get("/getallaccount", authMiddleware, getallaccount);

// GET balance of user
router.get("/balance/:accountNumber", authMiddleware, getbalance)
// get applied accounts
router.get("/appliedaccounts", authMiddleware, getappliedaccounts);





router.post("/admin/approve-account/:userId/:refrencenumber", sytemusermiddleware, approveAccount);
router.post("/admin/reject-account/:userId/:refrencenumber", sytemusermiddleware, rejectAccount);
router.post("/admin/approve-frozen-account/:accountNumber", sytemusermiddleware, approvefrozenaccount);

router.get("/admin/pending-accounts", sytemusermiddleware, getallpendingaccounts);
router.get("/admin/flagged-transactions/:accountNumber", sytemusermiddleware, getflaggedtransactions);
router.get("/admin/accountdetails/:accountNumber", sytemusermiddleware, getaccountdetails);


module.exports = router;