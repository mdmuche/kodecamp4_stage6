const { Schema: schema, model } = require("mongoose");

const userSchema = new schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    authToken: {
      type: String,
    },
    authPurpose: {
      type: String,
    },
  },
  { timestamps: true }
);

const userCollection = model("users", userSchema);

module.exports = userCollection;
