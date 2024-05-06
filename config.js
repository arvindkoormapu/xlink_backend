const { Pool } = require("pg");
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");

const DB = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

// ##############################
// UserRole const
const UserRole = {
  ADMIN: 1,
  VENDOR: 2,
  PLATFORM: 3,
};
Object.freeze(UserRole);

// ##############################
// Upload config
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });
// const Upload = multer({ storage: storage });
const Upload = multer();

AWS.config.update({ region: 'me-central-1' });
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'me-central-1'
});

// ##############################
// Send Email
// Configure Nodemailer with your email service credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Function to send email
const sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: to,
    subject: subject,
    html: html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = {
  DB,
  UserRole,
  Upload,
  sendEmail,
  s3
};
