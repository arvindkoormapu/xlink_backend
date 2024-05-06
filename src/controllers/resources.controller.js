const ResourcesModel = require("../models/resources.model");

const getResources = async (req, res) => {
  try {
    const user = req.user;
    const resources = await ResourcesModel.getResources(user.userprofileid);
    res.json({ success: true, data: resources });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const addResources = async (req, res) => {
  try {
    const {
      name,
      resourcetype,
      limitedavailability,
      resourcelimit,
      sharedbetweenproducts,
      sharedbetweenbookings,
      vendorprofileid,
    } = req.body;

    const newObj = await ResourcesModel.addResources(
      name,
      resourcetype,
      limitedavailability,
      resourcelimit,
      sharedbetweenproducts,
      sharedbetweenbookings,
      vendorprofileid
    );
    return res.status(201).json({ success: true, data: newObj });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateResources = async (req, res) => {
  try {
    const resourceid = req.params.id;
    const {
      name,
      resourcetype,
      limitedavailability,
      resourcelimit,
      sharedbetweenproducts,
      sharedbetweenbookings,
    } = req.body;

    await ResourcesModel.updateResources(
      name,
      resourcetype,
      limitedavailability,
      resourcelimit,
      sharedbetweenproducts,
      sharedbetweenbookings,
      resourceid
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getResources,
  addResources,
  updateResources,
};
