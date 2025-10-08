import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

//register user
export const registerUser = async (req, res) => {
  //extracting the data from req body
  const newUser = req.body;

  //checking if the user already exists
  const user = await User.findOne({ where: { email: newUser.email } });
  if (user) {
    return res.status(409).send({ message: "User already exists." });
  }

  //send verification email
  //generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  newUser.otp = otp;
  newUser.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  //send verification email
  await sendOtpVerificationEmail(newUser.email, newUser.name, otp);

  //hashing the password
  const plainPassword = newUser.password;
  const saltRound = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRound);

  newUser.password = hashedPassword;

  //new user is inserted to the database if all clears
  await User.create(newUser);

  //send response
  return res.status(201).send({
    message: "User is registered successfully",
    user: newUser,
  });
};

//send verification email
const sendOtpVerificationEmail = async (email, name, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `<p>Hi ${name},</p>
             <p>Your OTP for email verification is: <strong>${otp}</strong></p>
             <p>Thank you!</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email: ", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

//verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email: email } });

    //check if user exists and otp is valid

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).send({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).send({ message: "OTP has expired" });
    }
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    return res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

//login user
export const loginUser = async (req, res) => {
  //extract login credentials from req body
  const loginCredentials = req.body;

  //find user using email
  const user = await User.findOne({ where: { email: loginCredentials.email } });

  //if not user, throw error
  if (!user) {
    return res.status(404).send({
      message: "Invalid credentials",
    });
  }

  //if user is not verified
  if (!user.isVerified) {
    return res.status(401).send({
      message: "Email is not verified. Please verify your email to login.",
    });
  }

  //compare password with hashed password using bcrypt
  const plainPassword = loginCredentials.password;
  const hashedPassword = user.password;
  const isPasswordMatch = await bcrypt.compare(plainPassword, hashedPassword);

  //if not password, throw error
  if (!isPasswordMatch) {
    return res.status(404).send({
      message: "Invalid credentials",
    });
  }

  //if password matches, generate token using jwt
  const payload = { email: user.email, role: user.role };
  const secretKey = process.env.SECRET_KEY;
  const accessToken = jwt.sign(payload, secretKey);

  //generate refresh token using jwt
  const refreshSecretKey = process.env.REFRESH_SECRET_KEY;
  const refreshToken = jwt.sign(payload, refreshSecretKey, { expiresIn: "7d" });

  //send response
  return res.status(200).send({
    message: "User is logged in successfully",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};

//logout user
export const logoutUser = async (req, res) => {
  const user = await User.findOne({ where: { email: req.user.email } });
  if (!user) {
    return res.status(404).send({ message: "User not found." });
  }
  user.refreshToken = null;
  await user.save();
  return res.status(200).send({ message: "User logged out successfully." });
};

//send reset password email
const sendResetPasswordEmail = async (email, name, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      // host: "smtp.gmail.com",
      // port: 587,
      // secure: false,
      // requireTLS: true,
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Hi ${name},</p>
             <p>You requested for a password reset. Click the link below to reset your password:</p>
             <p><a href="http://localhost:5173/resetPassword?token=${resetToken}">Reset Password</a></p>
             <p>If you did not request this, please ignore this email.</p>
             <p>Thank you!</p>
              <p>${resetToken}</p>
             `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email: ", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

//forget password
export const forgetPassword = async (req, res) => {
  try {
    // console.log("req.body:", req.body);
    const { email } = req.body;
    const userDetails = await User.findOne({ where: { email: email } });
    // console.log(userDetails.email);

    if (!userDetails) {
      return res.status(404).send({ message: "User not found" });
    }

    // const email = userDetails.email;
    // console.log(email);

    //generate a reset token (in a real application, this should be more secure and time-limited)
    // const resetToken = jwt.sign({ email: email }, "resetSecretKey", {
    //   expiresIn: "1h",
    // });

    const resetToken = crypto.randomBytes(32).toString("hex");

    userDetails.resetToken = resetToken;
    userDetails.resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    await userDetails.save();

    sendResetPasswordEmail(email, userDetails.name, resetToken);

    return res
      .status(200)
      .send({ message: "Check your email for the reset link", resetToken });
  } catch (error) {
    if (error) {
      return res.status(400).send({ message: error.message });
    }
  }
};

//reset password
export const resetPassword = async (req, res) => {
  try {
    const token = req.params.resetToken;
    const newPassword = req.body.newPassword;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset token fields
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.status(200).json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


