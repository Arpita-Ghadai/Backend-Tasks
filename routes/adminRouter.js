const express = require("express");

const adminRouter = express.Router();
const adminController = require("../controller/adminController");

const { isAdmin } = require("../middlewares/isAdmin");

//GET /api/profile to return user details

adminRouter.get("/getallusers", isAdmin, adminController.getAllUsers);
//DELETE user
adminRouter.delete("/deleteuser/:id", isAdmin, adminController.deleteUser);

module.exports = adminRouter;
