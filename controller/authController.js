const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

exports.postRegister = [
  //Checking Validations
  check("username")
    .notEmpty()
    .trim()
    .isLength({ min: 2 })
    .withMessage(" Name should be atleast two Characters"),
  check("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid Email")
    .isLength({ max: 254 })
    .withMessage("Email must be less than 254 characters")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage("Email format is invalid")
    .custom((value) => {
      const disposableEmailDomains = [
        "10minutemail.com",
        "tempmail.org",
        "guerrillamail.com",
        "mailinator.com",
        "yopmail.com",
        "temp-mail.org",
        "throwaway.email",
      ];

      const emailDomain = value.split("@")[1];
      if (disposableEmailDomains.includes(emailDomain.toLowerCase())) {
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

      const domainPart = emailDomain;
      if (domainPart.length < 2) {
        throw new Error("Email domain is too short");
      }

      const tld = domainPart.split(".").pop();
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

  check("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password should be atleast 8 characters")

    .matches(/[A-Z]/)
    .withMessage("Password must contain one Uppercase")
    .matches(/[a-z]/)
    .withMessage("Password must contain one Lowercase")
    .matches(/[0-9]/)
    .withMessage("Password must contain one Number")
    .matches(/[!@#$%^&*(){}:"?/.,]/)
    .withMessage("Password must contain Special Characters"),

  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors = errors.array().map((err) => err.msg);
      return res.status(422).json({
        success: false,
        message: "Please fix the following errors",
        errors,
      });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    // Checking if user already exists
    User.findOne({ email: email })
      .then((existingUser) => {
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "User already exists",
          });
        }

        // Hashing password using bcrypt
        return bcrypt.hash(password, 12);
      })
      .then((hashPassword) => {
        const newUser = new User({
          username,
          email,
          password: hashPassword,
        });

        return newUser.save();
      })
      .then((savedUser) => {
        return res.status(201).json({
          success: true,
          message: "Registration successfully",
          user: savedUser,
        });
      })
      .catch((error) => {
        console.error("Registration error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      });
  },
];

exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Verifying password
      return bcrypt.compare(password, user.password).then((isValid) => {
        if (!isValid) {
          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });

        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
          maxAge: 259200000,
        });

        return res.status(200).json({
          success: true,
          message: "User logged in successfully",
          user: user,
          token,
        });
      });
    })
    .catch((error) => {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    });
};

exports.postLogout = (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Successfully logout" });
};
