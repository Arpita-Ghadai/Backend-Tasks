const express = require("express");

const preferenceRouter = express.Router();
const preferenceController = require("../controller/preferenceController");

const { isAdmin } = require("../middlewares/isAdmin");

preferenceRouter.post("/savetheme", preferenceController.savePreferences);

//Only admin can access all the saved prefernces
preferenceRouter.get(
  "/get-theme",
  isAdmin,
  preferenceController.getPreferences
);

module.exports = preferenceRouter;
