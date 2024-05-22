const ActivitiesModel = require("../models/activities.model");

const get = async (req, res) => {
  try {
    const activities = await ActivitiesModel.get(req.params.vendorId);
    res.json({ success: true, data: activities });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, categoryid, vendorprofileid } = req.body;

    const newObj = await ActivitiesModel.create({
      name,
      description,
      categoryid,
      vendorprofileid,
    });
    return res.status(201).json({ success: true, data: newObj });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const activityid = req.params.id;
    const {
      name = null,
      description = null,
      inventorytype = null,
      categoryid = 0,
      vendorprofileid = 0,
      advertisedduration = 0,
      advertisedprice = 0,
      highlights = null,
      location = null,
    } = req.body;

    const files = req.files;

    await ActivitiesModel.update(
      name,
      description,
      inventorytype,
      categoryid,
      vendorprofileid,
      advertisedduration,
      advertisedprice,
      highlights,
      files,
      location,
      activityid
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const id = req.params.id;
    await ActivitiesModel.deleteActivity(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  get,
  create,
  update,
  deleteActivity,
};
