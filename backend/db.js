require("dotenv").config();
const mongoose = require("mongoose");

module.exports = async function connect() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
};
