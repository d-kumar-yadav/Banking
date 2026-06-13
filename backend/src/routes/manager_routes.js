const express= require("express");
const router = express.Router();
const {superadminMiddleware} = require("../middleware/superadmin_middleware");

const { createManager, getAllManagers, getManagerById, updateManager, deleteManager } = require("../controller/manager_controll");

router.post("/create-manager", superadminMiddleware, createManager);
router.get("/get-all-managers", superadminMiddleware, getAllManagers);
router.get("/get-manager/:id", superadminMiddleware, getManagerById);
router.put("/update-manager/:id", superadminMiddleware, updateManager);
router.delete("/delete-manager/:id", superadminMiddleware, deleteManager);

module.exports = router;