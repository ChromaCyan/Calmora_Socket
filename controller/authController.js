const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const OTP = require("../model/otpModel");
const User = require("../model/userModel");
const Patient = require("../model/patientModel");
const Specialist = require("../model/specialistModel");
const otpEmail = require("../utils/templates/otpEmail");
const verifyEmail = require("../utils/templates/verifyEmail");
const accountPendingEmail = require("../utils/templates/accountPending");

const JWT_SECRET = process.env.JWT_SECRET || "123_123";
const otps = {};
const pendingRegistrations = {};

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const sendMail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Calmora Support" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
};

// OTP Verification
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const storedOTP = otps[`${email}_reset`];

  if (!storedOTP) {
    return res
      .status(404)
      .json({ success: false, message: "No OTP found for this email" });
  }

  if (storedOTP.expires < Date.now()) {
    delete otps[email];
    return res.status(400).json({ success: false, message: "OTP has expired" });
  }

  if (storedOTP.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  delete otps[email];
  return res.status(200).json({ success: true, message: "OTP verified" });
};

// Register User
exports.createUser = async (req, res) => {
  const { firstName, lastName, email, password, gender, otp, ...otherDetails } =
    req.body;

  try {
    const lowerCaseEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Step 1: Check OTP before registration
    const storedOTP = await OTP.findOne({ email: lowerCaseEmail });
    if (!storedOTP) {
      return res
        .status(404)
        .json({ message: "Please verify your email first (no OTP found)" });
    }

    if (storedOTP.expiresAt < new Date()) {
      await OTP.deleteOne({ email: lowerCaseEmail });
      return res
        .status(400)
        .json({ message: "OTP expired, please request a new one" });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // If valid → mark verified and continue registration
    storedOTP.verified = true;
    await storedOTP.save();

    let newUser;

    // Specialist registration
    if (req.body.specialization) {
      const extractLicenseData = require("../utils/templates/extractLicenseData");
      newUser = new Specialist({
        firstName,
        lastName,
        email: lowerCaseEmail,
        password,
        gender,
        approvalStatus: "pending",
        ...otherDetails,
      });

      await newUser.save();

      const ocrData = await extractLicenseData(newUser.licenseNumber);

      if (ocrData) {
        await Specialist.findByIdAndUpdate(newUser._id, {
          licenseVerificationData: ocrData,
        });
      }

      // Send "under review" email
      await sendMail({
        to: lowerCaseEmail,
        subject: "Your Specialist Registration is Under Review",
        text: `Hi ${firstName},

Thank you for registering as a specialist with Calmora.
Your account is currently under review by our admin team.
You will receive another email once your account has been approved or rejected.

- Calmora Team`,
        html: accountPendingEmail(newUser.firstName),
      });

      return res.status(201).json({
        message: "Specialist registered successfully, pending admin approval",
        userId: newUser._id,
      });
    }

    // Patient registration
    newUser = new Patient({
      firstName,
      lastName,
      email: lowerCaseEmail,
      password,
      gender,
      ...otherDetails,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    // Once successfully created → mark emailVerified = true
    await User.updateOne(
      { email: lowerCaseEmail },
      { $set: { emailVerified: true } }
    );

    return res.status(201).json({
      message: "Patient created successfully",
      token,
      userId: newUser._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send verification OTP
exports.sendVerificationOTP = async (req, res) => {
  const { email } = req.body;
  const lowerCaseEmail = email.toLowerCase();

  try {
    const existingUser = await User.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.findOneAndUpdate(
      { email: lowerCaseEmail },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    await sendMail({
      to: lowerCaseEmail,
      subject: "Verify Your Calmora Email",
      html: verifyEmail("User", otp),
    });

    res.status(200).json({ message: "Verification OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};