const express = require("express");
const dotenv = require("dotenv");
const DbCon = require("./utils/db");
const cookieParser = require("cookie-parser");

const app = express();

dotenv.config();

//Routes
const authRouter = require("./routes/authRouter");
const adminRouter = require("./routes/adminRouter");
const preferenceRouter = require("./routes/preferenceRouter");
const dashboardRouter = require("./routes/dashboardRouter");
const profileRouter = require("./routes/profileRouter");
//db connection
DbCon();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//1. User authentication System- Login and Register
app.use("/api", authRouter);

//1.User authentication system - Protected - Only admin can use - Get all the user details and delete
app.use("/api", adminRouter);

//2.Save Preference and Get Preferences:
app.use("/api", preferenceRouter);

//3.Bonus EndPoint - Dashboard Summary
app.use("/api", dashboardRouter);

//4. Profile Details - Get own profile details and update profile
app.use("/api", profileRouter);

//Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
