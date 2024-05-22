const PackagesModel = require("../models/packages.model");

const get = async (req, res) => {
  try {
    const packages = await PackagesModel.get(req.params.activity_id);
    res.json({ success: true, data: packages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const {
      packagename,
      packagedescription,
      pricestartsfrom,
      included,
      notincluded,
      duration,
      termsandcondition,
      activityid,
    } = req.body;
    const newObj = await PackagesModel.create({
      packagename,
      packagedescription,
      pricestartsfrom,
      included,
      notincluded,
      duration,
      termsandcondition,
      activityid,
    });
    return res.status(201).json({ success: true, data: newObj });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      packagename,
      packagedescription,
      pricestartsfrom,
      isenabled = true,
      included,
      notincluded,
      duration,
      termsandcondition,
    } = req.body;

    const files = req.files;

    await PackagesModel.update(
      id,
      packagename,
      packagedescription,
      pricestartsfrom,
      isenabled,
      included, 
      notincluded, 
      duration, 
      termsandcondition, 
      files
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePackage = async (req, res) => {
  try {
    const id = req.params.id;
    await PackagesModel.deletePackage(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  get,
  create,
  update,
  deletePackage
};
