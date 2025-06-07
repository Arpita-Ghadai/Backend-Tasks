const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { check, validationResult } = require("express-validator");

exports.getProfile = (req, res, next) => {
  let token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided. Please Login First",
    });
  }

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
      res.status(200).json({
        sucess: true,
        message: "User data fetched successfully",
        user: {
          name: user.username,
          email: user.email,
        },
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    });
};

exports.updateProfile = [
  // Checking Validations
  check("username")
    .notEmpty()
    .withMessage("Username is required")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Username should be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, dots, hyphens, and underscores"
    ),

  check("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .isLength({ max: 254 })
    .withMessage("Email must be less than 254 characters")
    .custom((value, { req }) => {
      const disposableEmailDomains = [
        "10minutemail.com",
        "tempmail.org",
        "guerrillamail.com",
        "mailinator.com",
        "yopmail.com",
        "temp-mail.org",
        "throwaway.email",
        "trashmail.com",
        "maildrop.cc",
      ];

      const emailDomain = value.split("@")[1]?.toLowerCase();

      if (!emailDomain) {
        throw new Error("Invalid email format");
      }

      if (disposableEmailDomains.includes(emailDomain)) {
        throw new Error("Please use a permanent email address");
      }

      if (value.includes("..")) {
        throw new Error("Email cannot contain consecutive dots");
      }

      const localPart = value.split("@")[0];
      if (localPart.startsWith(".") || localPart.endsWith(".")) {
        throw new Error("Email cannot start or end with a dot");
      }

      const validLocalPartRegex = /^[a-zA-Z0-9._%+-]+$/;
      if (!validLocalPartRegex.test(localPart)) {
        throw new Error("Email contains invalid characters");
      }

      if (emailDomain.length < 4) {
        throw new Error("Email domain is too short");
      }

      const tld = emailDomain.split(".").pop();
      if (tld.length < 2) {
        throw new Error("Email domain extension is invalid");
      }

      return true;
    })
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false,
    }),

  (req, res) => {
    console.log("Update profile request:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      return res.status(422).json({
        success: false,
        message: "Please fix the following errors",
        errors: errorMessages,
      });
    }

    const { username, email } = req.body;

    const token =
      req.cookies.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login first",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login first",
      });
    }

    const userId = decoded.userID || decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    User.findById(userId)
      .then((currentUser) => {
        if (!currentUser) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        const emailCheckPromise =
          currentUser.email !== email
            ? User.findOne({
                email: email,
                _id: { $ne: userId },
              })
            : Promise.resolve(null);

        const usernameCheckPromise =
          currentUser.username !== username
            ? User.findOne({
                username: username,
                _id: { $ne: userId },
              })
            : Promise.resolve(null);

        return Promise.all([emailCheckPromise, usernameCheckPromise])
          .then(([existingEmail, existingUsername]) => {
            if (existingEmail) {
              return res.status(400).json({
                success: false,
                message: "Email is already registered with another account",
              });
            }

            if (existingUsername) {
              return res.status(400).json({
                success: false,
                message: "Username is already taken",
              });
            }

            return User.findByIdAndUpdate(
              userId,
              {
                username: username,
                email: email,
                updatedAt: new Date(),
              },
              {
                new: true,
                runValidators: true,
              }
            ).select("-password");
          })
          .then((updatedUser) => {
            if (!updatedUser) {
              return res.status(404).json({
                success: false,
                message: "Unable to update user profile",
              });
            }

            return res.status(200).json({
              success: true,
              message: "Profile updated successfully",
              user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                updatedAt: updatedUser.updatedAt,
              },
            });
          });
      })
      .catch((error) => {
        console.error("Update profile error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error. Please try again later.",
        });
      });
  },
];
