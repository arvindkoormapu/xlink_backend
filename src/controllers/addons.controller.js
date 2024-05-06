const AddonsModel = require("../models/addons.model");

const getAddons = async (req, res) => {
  try {
    const user = req.user;
    const addons = await AddonsModel.getAddons(user.userprofileid);
    res.json({ success: true, data: addons });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const addAddons = async (req, res) => {
  try {
    const {
      name,
      price,
      pricingoption,
      description,
      limitedavailability,
      totalquantity,
      consumedquantity,
      vendorprofileid,
    } = req.body;

    const newObj = await AddonsModel.addAddons(
      name,
      price,
      pricingoption,
      description,
      limitedavailability,
      totalquantity,
      consumedquantity,
      vendorprofileid
    );
    return res.status(201).json({ success: true, data: newObj });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAddons = async (req, res) => {
  try {
    const addonid = req.params.id;
    const {
      name,
      price,
      pricingoption,
      description,
      limitedavailability,
      totalquantity,
      consumedquantity,
    } = req.body;

    await AddonsModel.updateAddons(
      name,
      price,
      pricingoption,
      description,
      limitedavailability,
      totalquantity,
      consumedquantity,
      addonid
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAddons,
  addAddons,
  updateAddons,
};
