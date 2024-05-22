const SessionModel = require("../models/session.model");

const create = async (req, res) => {
  try {
    const {
      label,
      totalquantity,
      starttime,
      endtime,
      interval,
      packageid,
      repeattype,
      repeatinterval,
      days
    } = req.body;

    await SessionModel.create(
      label,
      totalquantity,
      starttime,
      endtime,
      interval,
      packageid,
      repeattype,
      repeatinterval,
      days
    );
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const get = async (req, res) => {
  try {
    const session = await SessionModel.get(req.params.package_id);
    res.json({ success: true, data: session });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const id = req.params.id;
    await SessionModel.deleteSession(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  create,
  get,
  deleteSession
};
