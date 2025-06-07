const express = require("express");
const authRouter = express.Router();

const authController = require("../controller/authController");

authRouter.post("/register", authController.postRegister);
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.postLogout);
module.exports = authRouter;
