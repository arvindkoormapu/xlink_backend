const { DB } = require("../../config");

const get = async (packageid) => {
  const result = await DB.query(
    `SELECT *
      FROM tickets
      WHERE packageid = $1`,
    [packageid]
  );

  return result.rows;
};

const add = async (
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
) => {
  const newObj = await DB.query(
    "INSERT INTO tickets (ticketname, priceamount,isindividualpricing,active,totalorperunit,min,max,quantityused,vendorprofileid,packageid,ticketdescription) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
    [
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
    ]
  );

  return newObj.rows[0];
};

const update = async (
  ticketname,
  priceamount,
  isindividualpricing,
  active,
  totalorperunit,
  min,
  max,
  quantityused,
  ticketdescription,
  ticketid
) => {
  const query = `
            UPDATE tickets
            SET ticketname = $1, priceamount = $2, isindividualpricing = $3, active = $4, totalorperunit = $5, min = $6, max = $7, quantityused = $8, ticketdescription = $9
            WHERE ticketid = $10
        `;
  const values = [
    ticketname,
    priceamount,
    isindividualpricing,
    active,
    totalorperunit,
    min,
    max,
    quantityused,
    ticketdescription,
    ticketid,
  ];

  await DB.query(query, values);
};

module.exports = {
  get,
  add,
  update,
};
