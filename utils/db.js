const mongoose = require("mongoose");

const DbCon = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Mongodb is connected");
  } catch {
    console.log("MOngodb connection error come to db.js in utils");
  }
};

module.exports = DbCon;
