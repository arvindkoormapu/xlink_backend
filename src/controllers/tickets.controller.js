const TicketsModel = require("../models/tickets.model");

const get = async (req, res) => {
  try {
    const data = await TicketsModel.get(req.params.packageId);
    res.json({ success: true, data: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const add = async (req, res) => {
  try {
    const {
      ticketname,
      priceamount,
      isindividualpricing,
      active,
      totalorperunit,
      min,
      max,
      quantityused,
      vendorprofileid,
      packageid,
      ticketdescription,
    } = req.body;

    const newObj = await TicketsModel.add(
      ticketname,
      priceamount,
      isindividualpricing,
      active,
      totalorperunit,
      min,
      max,
      quantityused,
      vendorprofileid,
      packageid,
      ticketdescription
    );
    return res.status(201).json({ success: true, data: newObj });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const {
      ticketname,
      priceamount,
      isindividualpricing,
      active,
      totalorperunit,
      min,
      max,
      quantityused,
      ticketdescription
    } = req.body;

    await TicketsModel.update(
      ticketname,
      priceamount,
      isindividualpricing,
      active,
      totalorperunit,
      min,
      max,
      quantityused,
      ticketdescription,
      ticketId
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  get,
  add,
  update,
};
