const express = require("express");

const dashboardRouter = express.Router();
const dashboardController = require("../controller/dashboardController");

const { isAdmin } = require("../middlewares/isAdmin");

//3.GET /api/dashboard-summary: Return dummy data for team, projects, and notifications
dashboardRouter.get(
  "/dashboard-summary",
  isAdmin,
  dashboardController.getDashboardSummary
);

module.exports = dashboardRouter;
