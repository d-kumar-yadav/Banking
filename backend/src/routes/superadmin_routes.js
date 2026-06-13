const express= require("express");
const router = express.Router();
const { createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch  , allocate_funds , branch_tranx  , login ,register , logout} = require("../controller/superadmin_controll");
const {superadminMiddleware} = require("../middleware/superadmin_middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
 router.post("/branches", superadminMiddleware, createBranch);
 router.get("/branches", superadminMiddleware, getAllBranches);
 router.get("/branches/:id", superadminMiddleware, getBranchById);
 router.put("/branches/:id", superadminMiddleware, updateBranch);
 router.delete("/branches/:id", superadminMiddleware, deleteBranch);
router.post("/branches/allocate-funds", superadminMiddleware, allocate_funds);
router.get("/branches/:accountNumber/transactions", superadminMiddleware, branch_tranx);

module.exports = router;   