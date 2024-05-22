const { DB } = require("../../config");

const getResources = async (vendorProfileId) => {
  const result = await DB.query(
    `SELECT *
      FROM resources
      WHERE vendorprofileid = $1`,
    [vendorProfileId]
  );

  return result.rows;
};

const addResources = async (
  name,
  resourcetype,
  limitedavailability,
  resourcelimit,
  sharedbetweenproducts,
  sharedbetweenbookings,
  vendorprofileid
) => {
  const newObj = await DB.query(
    "INSERT INTO resources (name, resourcetype, limitedavailability, resourcelimit, sharedbetweenproducts, sharedbetweenbookings, vendorprofileid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [
      name,
      resourcetype,
      limitedavailability,
      resourcelimit,
      sharedbetweenproducts,
      sharedbetweenbookings,
      vendorprofileid,
    ]
  );

  return newObj.rows[0];
};

const updateResources = async (
  name,
  resourcetype,
  limitedavailability,
  resourcelimit,
  sharedbetweenproducts,
  sharedbetweenbookings,
  resourceid
) => {
  const query = `
            UPDATE resources
            SET name = $1, resourcetype = $2, limitedavailability = $3, resourcelimit = $4, sharedbetweenproducts = $5, sharedbetweenbookings = $6
            WHERE resourceid = $7
        `;
  const values = [
    name,
  resourcetype,
  limitedavailability,
  resourcelimit,
  sharedbetweenproducts,
  sharedbetweenbookings,
  resourceid
  ];

  await DB.query(query, values);
};

module.exports = {
  getResources,
  addResources,
  updateResources,
};
