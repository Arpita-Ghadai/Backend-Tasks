const jwt = require("jsonwebtoken");
const User = require("../models/user");
exports.isAdmin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(402).json({
      success: false,
      message: "Unauthorised first login",
    });
  }
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decode);
  User.findById(decode.userID)
    .then((user) => {
      if (!user) {
        return res.status(402).json({
          success: false,
          message: "Internal Server Error",
        });
      }
      console.log(user.role);
      if (user.role === "admin") {
        next();
      } else {
        return res.status(402).json({
          success: false,
          message: "You are unauthorised",
        });
      }
    })
    .catch((err) =>
      res.status(402).json({
        success: false,
        message: "Internal Server Error",
      })
    );
};
