const express= require("express");
const router = express.Router();
const { createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch, allocate_funds, branch_tranx, login,  logout, add_employee, add_to_branch, getEmployeeById, updateEmployee, deleteEmployee, getMe, getAllEmployees, branchbalane ,intialfundcontroller} = require("../controller/superadmin_controll");
const {superadminMiddleware} = require("../middleware/superadmin_middleware");
const { employeeMiddleware } = require("../middleware/auth_middleware");

 router.post("/branche", superadminMiddleware, createBranch);
 router.get("/branche", superadminMiddleware, getAllBranches);
 router.get("/branche/:id", superadminMiddleware, getBranchById);
 router.put("/branche/:id", superadminMiddleware, updateBranch);
 router.delete("/branche/:id", superadminMiddleware, deleteBranch);
router.post("/branche/allocate-funds", superadminMiddleware, allocate_funds);
router.get("/branche/:accountNumber/transactions", superadminMiddleware, branch_tranx);

router.post("/employee/login", login);  // for superadmin  , manager and employee 
router.post("/employee/logout", logout);
router.post("/employee/add_employee", superadminMiddleware, add_employee);
router.post("/employee/add_to_branch", superadminMiddleware, add_to_branch);
router.get("/employee/all", superadminMiddleware, getAllEmployees);
router.get("/employee/get_employee/:id", superadminMiddleware, getEmployeeById);
router.put("/employee/update_employee/:id", superadminMiddleware, updateEmployee);
router.delete("/employee/delete_employee/:id", superadminMiddleware, deleteEmployee);


// Employee own data
router.get("/employee/me", employeeMiddleware, getMe);
router.get("/employee/branch/balance", employeeMiddleware, branchbalane);
router.post("/employee/intialfund", employeeMiddleware, intialfundcontroller);



module.exports = router;   