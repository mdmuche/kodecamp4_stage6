var express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const { sendEmail } = require("../utils/emailUtils");

const userCollection = require("../model/userModel");
const tokenCollection = require("../model/tokenModel");

var router = express.Router();
const saltRounds = 10;

router.post("/register", async function (req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    console.log(req.body);

    if (!fullName || !email || !password) {
      res.status(400).send({ message: "input field required" });
      return;
    }

    const userEmail = await userCollection.exists({ email });
    if (userEmail) {
      res.status(400).send("user already exists with email");
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const token = v4();

    await userCollection.create({
      fullName,
      email,
      password: hashedPassword,
      authToken: token,
      authPurpose: "verify-email",
    });

    await sendEmail(
      email,
      "verify email",
      "Hello " +
        fullName +
        " the link to verify your email is http://localhost:3000/v1/auth/verify-email/" +
        token
    );

    res.status(201).send({
      message: "user created, kindly check your email to verify it",
    });
  } catch (err) {
    console.error("server error", err.message);
    res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

router.get("/verify-email/:token", async (req, res, next) => {
  try {
    const { token } = req.params;

    const doesUserExist = await userCollection.exists({
      authToken: token,
      authPurpose: "verify-email",
    });

    if (!doesUserExist) {
      return res.status(404).send({
        message: "the user does not exist",
      });
    }

    await userCollection.findOneAndUpdate(
      {
        authToken: token,
        authPurpose: "verify-email",
      },
      {
        isEmailVerified: true,
        authToken: "",
        authPurpose: "",
      }
    );

    res.send({
      message: "Email verified successfully!",
    });
  } catch (err) {
    console.error("server error", err.message);
    res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send("input field required");
      return;
    }

    const userDetails = await userCollection.findOne({ email });

    if (!userDetails) {
      res.status(404).send({
        message: "user not found",
      });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, userDetails.password);

    if (!passwordMatch) {
      res.status(404).send({
        message: "invalid credentials",
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: userDetails._id,
        fullName: userDetails.fullName,
        email: userDetails.email,
        role: userDetails.role,
      },
      process.env.SECRET
    );
    res.send({
      message: "login successful",
      userDetails: {
        fullName: userDetails.fullName,
        email: userDetails.email,
        role: userDetails.role,
      },
      token,
    });
  } catch (err) {
    console.error("server error", err.message);
    res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "invalid input" });
    }

    const user = await userCollection.findOne({ email });

    if (!user) {
      res.status(404).send({
        message: "user not found",
      });
      return;
    }

    const token = v4();

    await tokenCollection.create({
      userId: user._id,
      token,
    });

    res.status(201).send({
      message: "password reset token generated",
      token,
    });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const resetToken = await tokenCollection.findOne({ token });

    if (!resetToken) {
      res.status(404).send("invalid or expired token");
      return;
    }

    const user = await userCollection.findById(resetToken.userId);

    if (!user) {
      res.status(404).send({
        message: "user not found",
      });
      return;
    }

    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

    const newAuthToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.SECRET
    );

    await userCollection.findByIdAndUpdate(resetToken.userId, {
      password: hashedPassword,
      authToken: newAuthToken,
    });

    await tokenCollection.deleteOne({ token });

    res.send({ message: "password reset was successful" });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

module.exports = router;
