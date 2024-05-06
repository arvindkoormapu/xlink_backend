const { DB } = require("../../config");

const getAddons = async (id) => {
  const vendorProfileResult = await DB.query(
    `SELECT vup.*, vp.*
      FROM vendoruserprofile vup
      JOIN vendorprofile vp ON vup.vendorid = vp.vendorid
      WHERE vup.userprofileid = $1`,
    [id]
  );

  const vendorProfileIds = vendorProfileResult.rows.map((row) => row.vendorid);
  if (!Array.isArray(vendorProfileIds)) {
    throw new Error("ids must be an array");
  }

  const result = await DB.query(
    `SELECT *
      FROM addons
      WHERE vendorprofileid = ANY($1)`,
    [vendorProfileIds]
  );

  return result.rows;
};

const addAddons = async (
  name,
  price,
  pricingoption,
  description,
  limitedavailability,
  totalquantity,
  consumedquantity,
  vendorprofileid
) => {
  const newObj = await DB.query(
    "INSERT INTO addons (name, price, pricingoption, description, limitedavailability, totalquantity, consumedquantity, vendorprofileid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [
      name,
      price,
      pricingoption,
      description,
      limitedavailability,
      totalquantity,
      consumedquantity,
      vendorprofileid,
    ]
  );

  return newObj.rows[0];
};

const updateAddons = async (
  name,
  price,
  pricingoption,
  description,
  limitedavailability,
  totalquantity,
  consumedquantity,
  addonid
) => {
  const query = `
            UPDATE addons
            SET name = $1, price = $2, pricingoption = $3, description = $4, limitedavailability = $5, totalquantity = $6, consumedquantity = $7
            WHERE addonid = $8
        `;
  const values = [
    name,
    price,
    pricingoption,
    description,
    limitedavailability,
    totalquantity,
    consumedquantity,
    addonid
  ];

  await DB.query(query, values);
};

module.exports = {
  getAddons,
  addAddons,
  updateAddons,
};
