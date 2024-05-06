const UserProfileModel = require('../models/user-profile.model');
const crypto = require('crypto');
const { sendEmail } = require('../../config');

// Function to generate a random password
function generateRandomPassword(length = 12) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

const getUserProfiles = async (req, res) => {
  try {
    const users = await UserProfileModel.getUserProfiles();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: err.message });
  }
};

const addUserProfile = async (req, res) => {
  try {
    const { email, role, profileids } = req.body;
    const password = generateRandomPassword();

    await UserProfileModel.addUserProfile(email, password, role, profileids);

    // After successful signup, send an email
    const emailHtml = `
      <h1>Welcome to xLink</h1>
      <p>Your account has been created successfully.</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Password:</b> ${password}</p>
    `;

    await sendEmail(email, 'Your Account Details', emailHtml);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const { role, profileids } = req.body;

    await UserProfileModel.updateUserProfile(id, role, profileids);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUserProfile = async (req, res) => {
  try {
    const { id, role } = req.params;

    const deleted = await UserProfileModel.deleteUserProfile(id, role);
    if (deleted) {
      res.status(200).json({ success: true, message: 'UserProfile deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'UserProfile not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



module.exports = {
  getUserProfiles,
  addUserProfile,
  updateUserProfile,
  deleteUserProfile
};