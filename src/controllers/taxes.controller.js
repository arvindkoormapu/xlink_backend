const TaxesModel = require("../models/taxes.model");

const getTaxes = async (req, res) => {
  try {
    const user = req.user;
    const vendors = await TaxesModel.getTaxes(user.userprofileid);
    res.json({ success: true, data: vendors });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const addTaxes = async (req, res) => {
  try {
    const {
      type,
      percentage,
      value,
      priceinclusive,
      compound,
      isperticket,
      label,
      vendorprofileid,
    } = req.body;

    const newObj = await TaxesModel.addTaxes(
      type,
      percentage,
      value,
      priceinclusive,
      compound,
      isperticket,
      label,
      vendorprofileid
    );
    return res.status(201).json({ success: true, data: newObj });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTaxes = async (req, res) => {
  try {
    const taxid = req.params.id;
    const {
      type,
      percentage,
      value,
      priceinclusive,
      compound,
      isperticket,
      label,
    } = req.body;

    await TaxesModel.updateTaxes(
      type,
      percentage,
      value,
      priceinclusive,
      compound,
      isperticket,
      label,
      taxid
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getTaxes,
  addTaxes,
  updateTaxes,
};
