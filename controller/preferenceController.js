const Preference = require("../models/preference");
const jwt = require("jsonwebtoken");
exports.savePreferences = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised user , first login",
    });
  }
  let decode;
  try {
    decode = jwt.verify(token, process.env.JWT_SECRET);
  } catch (jwtError) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }

  const userId = decode.userID;
  const { theme, dashboardLayout, language } = req.body;

  if (theme && !["light", "dark"].includes(theme)) {
    return res.status(400).json({ success: false, message: "Invalid theme" });
  }

  if (
    dashboardLayout &&
    !["grid", "list", "compact"].includes(dashboardLayout)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid dashboard layout" });
  }

  Preference.findOneAndUpdate(
    { userId },
    {
      userId,
      ...(theme && { theme }),
      ...(dashboardLayout && { dashboardLayout }),
      ...(language && { language }),
    },
    {
      new: true,
      upsert: true,
    }
  )
    .then((preferences) => {
      res.status(200).json({
        success: true,
        message: "Preferences saved successfully",
        data: preferences,
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    });
};

exports.getPreferences = (req, res, next) => {
  Preference.find()
    .then((preferences) => {
      if (!preferences) {
        return res
          .status(404)
          .json({ success: false, message: "There are no saved preferences" });
      }
      return res.status(200).json({
        success: true,
        message: "Saved preferences found successfully",
        preferences,
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    });
};
