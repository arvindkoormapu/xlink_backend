const PlatformApiKeysModel = require("../models/platform-api-keys.model");

const getPlatformApiKeys = async (req, res) => {
  try {
    const user = req.user;
    const apikeys = await PlatformApiKeysModel.getPlatformApiKeys(
      user.userprofileid
    );
    return res.json({ success: true, data: apikeys });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const addPlatformApiKey = async (req, res) => {
  try {
    const user = req.user;
    const { name, whitelisted_ips, description } = req.body;

    const newObj = await PlatformApiKeysModel.addPlatformApiKey(
      name,
      whitelisted_ips,
      description,
      user.userprofileid
    );
    return res.status(201).json({ success: true, data: newObj });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateActiveState = async (req, res) => {
  try {
    const {id, active} = req.params;
    await PlatformApiKeysModel.updateActiveState(active, id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSeenState = async (req, res) => {
  try {
    const {id} = req.params;
    await PlatformApiKeysModel.updateSeenState(id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addPlatformApiKey,
  getPlatformApiKeys,
  updateActiveState,
  updateSeenState,
};
