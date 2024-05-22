const PlatformModel = require("../models/platform.model");

const getPlatformProfiles = async (req, res) => {
  try {
    const user = req.user;

    if (user.roleid == 1) {
      const platforms = await PlatformModel.getAllPlatformProfiles();
      return res.json({ success: true, data: platforms });
    }
    const platforms = await PlatformModel.getPlatformProfiles(
      user.userprofileid
    );
    res.json({ success: true, data: platforms });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPlatformProfile = async (req, res) => {
  try {
    const platforms = await PlatformModel.getPlatformProfile(
      req.params.platformId
    );
    res.json({ success: true, data: platforms });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const addPlatform = async (req, res) => {
  try {
    const user = req.user;
    const {
      name,
      emailaddress1,
      emailaddress2,
      contactnumber,
      officenumber,
      url,
      city,
      area,
      street,
      building,
      zipcode,
    } = req.body;
    const image = req.file;

    if (user.roleid == 1) {
      const newObj = await PlatformModel.addPlatformFromAdmin(
        name,
        emailaddress1,
        emailaddress2,
        contactnumber,
        officenumber,
        url,
        city,
        area,
        street,
        building,
        zipcode,
        image
      );
      return res.status(201).json({ success: true, data: newObj });
    }

    const newObj = await PlatformModel.addPlatform(
      name,
      emailaddress1,
      emailaddress2,
      contactnumber,
      officenumber,
      url,
      city,
      area,
      street,
      building,
      zipcode,
      image,
      user.userprofileid
    );
    res.status(201).json({ success: true, data: newObj });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updatePlatform = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      emailaddress1,
      emailaddress2,
      contactnumber,
      officenumber,
      url,
      city,
      area,
      street,
      building,
      zipcode,
    } = req.body;
    const image = req.file;
    await PlatformModel.updatePlatform(
      id,
      name,
      emailaddress1,
      emailaddress2,
      contactnumber,
      officenumber,
      url,
      city,
      area,
      street,
      building,
      zipcode,
      image
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePlatform = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await PlatformModel.deletePlatform(id);
    if (deleted) {
      res
        .status(200)
        .json({ success: true, message: "Platform deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Platform not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const whitelistVendor = async (req, res) => {
  const { platform_id, vendor_id } = req.body;

  try {
    const result = await PlatformModel.whitelistVendor(platform_id, vendor_id);
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getWhitelistVendor = async (req, res) => {
  const { platformId } = req.params;

  try {
    const result = await PlatformModel.getWhitelistVendor(platformId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addPlatform,
  getPlatformProfiles,
  getPlatformProfile,
  updatePlatform,
  deletePlatform,
  whitelistVendor,
  getWhitelistVendor
};
