const { DB } = require("../../config");

const getTaxes = async (id) => {
  const vendorProfileResult = await DB.query(
    `SELECT vup.*, vp.*
      FROM vendoruserprofile vup
      JOIN vendorprofile vp ON vup.vendorid = vp.vendorid
      WHERE vup.userprofileid = $1`,
    [id]
  );

  const vendorProfileIds = vendorProfileResult.rows.map((row) => row.vendorid);
  // Ensure ids is an array
  if (!Array.isArray(vendorProfileIds)) {
    throw new Error("ids must be an array");
  }

  const result = await DB.query(
    `SELECT *
      FROM taxes
      WHERE vendorprofileid = ANY($1)`,
    [vendorProfileIds]
  );

  return result.rows;
};

const addTaxes = async (
  type,
  percentage,
  value,
  priceinclusive,
  compound,
  isperticket,
  label,
  vendorprofileid
) => {
  const newObj = await DB.query(
    "INSERT INTO taxes (type, percentage, value, priceinclusive, compound, isperticket, label, vendorprofileid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [
      type,
      percentage,
      value,
      priceinclusive,
      compound,
      isperticket,
      label,
      vendorprofileid,
    ]
  );

  return newObj.rows[0];
};

const updateTaxes = async (
  type,
  percentage,
  value,
  priceinclusive,
  compound,
  isperticket,
  label,
  taxid
) => {
  const query = `
            UPDATE taxes
            SET type = $1, percentage = $2, value = $3, priceinclusive = $4, compound = $5, isperticket = $6, label = $7
            WHERE taxid = $8
        `;
  const values = [
    type,
    percentage,
    value,
    priceinclusive,
    compound,
    isperticket,
    label,
    taxid,
  ];

  await DB.query(query, values);
};

module.exports = {
  getTaxes,
  addTaxes,
  updateTaxes,
};
