const express = require("express");

const profileRouter = express.Router();
const profileController = require("../controller/profileController");

//1.GET /api/profile
profileRouter.get("/get-profile", profileController.getProfile);

//3.PATCH /api/profile: Allow email or name updates
profileRouter.patch("/profile", profileController.updateProfile);

module.exports = profileRouter;
