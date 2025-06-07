const User = require("../models/user");

exports.getAllUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      if (!users) {
        return res.status(402).json({
          success: false,
          message: "There  are no users",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Got the details",
        users: users,
      });
    })
    .catch((err) => {
      return res.status(402).json({
        success: false,
        message: "Unable to fetch the users",
      });
    });
};

exports.deleteUser = (req, res, next) => {
  const userId = req.params.id;
  User.findByIdAndDelete(userId)
    .then(() => {
      return res.status(200).json({
        success: true,
        message: "Successfully Deleted the user",
      });
    })
    .catch((err) => {
      return res.status(402).json({
        success: false,
        message: "Internal Server Error",
      });
    });
};
