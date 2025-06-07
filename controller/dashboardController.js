const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { check, validationResult } = require("express-validator");

exports.getDashboardSummary = (req, res, next) => {
  let token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided. Please Login First",
    });
  }

  //JWT Decoding
  let decode;
  try {
    decode = jwt.verify(token, process.env.JWT_SECRET);
  } catch (jwtError) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please Login First",
    });
  }

  const userId = decode.userID;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      const dummyDashboardData = {
        user: {
          id: userId,
          name: user.username,
          email: user.email,
        },
        team: {
          id: 25,
          name: "Backend Development",
          members: 8,
          role: "Lead Developer",
          description:
            "Building the backend for E-tailed digital services Pvt ltd Website",
        },
        projects: [
          {
            id: 1,
            component: "Authentication and Authorisation",
            status: "In progress",
            progress: "75",
            assignedMembers: 6,
            deadline: "2025-08-01",
            tasksCompleted: 15,
            description:
              "Developing secure user login and signup with encrypted password and JWT authorisation",
            totalTasks: 20,
          },
          {
            id: 2,
            component: "Dashboard",
            status: "In progress",
            progress: "50",
            assignedMembers: 8,
            deadline: "2025-06-08",
            tasksCompleted: 20,
            description:
              "Creating user's dashboard containing projects' and teams' details ",
            totalTasks: 40,
          },
        ],
        notifications: [
          {
            id: 23,
            type: "project_update",
            title: "Project milestone achieved",
            message:
              "Authentication and Authorisation Project reached 75% completion",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            read: false,
            priority: "medium",
          },
          {
            id: 25,
            type: "team_joined",
            title: "New member joined",
            message:
              "Arpita Ghadai joined the Backend Development Team and would be working for Authentication and Authorisation Project",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            read: false,
            priority: "low",
          },
          {
            id: 26,
            type: "deadline_reminder",
            title: "Upcoming deadline",
            message: "Dashboard Project due in 1 days",
            timestamp: new Date(Date.now()), // 1 day ago
            read: true,
            priority: "high",
          },
        ],
      };

      res.status(200).json({
        success: true,
        message: "Dashboard data retrieved successfully",
        data: dummyDashboardData,
      });
    })
    .catch((err) =>
      res.status(500).json({ success: false, message: "Internal Serve Error" })
    );
};
