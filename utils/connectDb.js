const mongoose = require("mongoose");

exports.conDb = async (cb) => {
  try {
    let db = await mongoose.connect(process.env.URL);
    console.log("connection to db was successful!");
    cb();
  } catch (err) {
    console.log("connection to db wasn't successful!", err.message);
  }
};
