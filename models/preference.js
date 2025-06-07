const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },

    dashboardLayout: {
      type: String,
      enum: ["grid", "list", "compact"],
      default: "grid",
    },
    language: {
      type: String,
      default: "en",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Preference", preferenceSchema);
