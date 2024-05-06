const { DB } = require('../../config');

const getVendorProfiles = async (id) => {
  const result = await DB.query(
    `SELECT vup.*, vp.*
     FROM vendoruserprofile vup
     JOIN vendorprofile vp ON vup.vendorid = vp.vendorid
     WHERE vup.userprofileid = $1`, 
    [id]
  );
  return result.rows;
};

const addVendor = async (name, emailaddress1, contactnumber, url, city, filePath, userprofileid) => {
  await DB.query('BEGIN');

  try {
    const newObj = await DB.query(
      'INSERT INTO vendorprofile (name, emailaddress1,  contactnumber, url, city, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, emailaddress1, contactnumber, url, city, filePath]
    );

    await DB.query('INSERT INTO vendoruserprofile (vendorid, userprofileid) VALUES ($1, $2) RETURNING *', [newObj.rows[0].vendorid, userprofileid])

    await DB.query('COMMIT');

    return newObj.rows[0];

  } catch (err) {
    await DB.query('ROLLBACK');
    throw err;
  }
};

const updateVendor = async (vendorId, name, emailaddress1, contactnumber, url, city, image) => {
  const query = `
    UPDATE vendorprofile
    SET name = $1, emailaddress1 = $2, contactnumber = $3, url = $4, city = $5
  `;

  let values = [name, emailaddress1, contactnumber, url, city];

  if (image != null) {
    query += `, image = $6`;
    values.push(image);
  }

  query += ` WHERE vendorid = $${values.length + 1}`;

  values.push(vendorId);

  await DB.query(query, values);
};

const deleteVendor = async (id) => {
  await DB.query('DELETE FROM vendoruserprofile WHERE vendorid = $1', [id]);
  const result = await DB.query('DELETE FROM vendorprofile WHERE vendorid = $1', [id]);
  return result.rowCount;
}

// For admin
const getAllVendorProfiles = async () => {
  const result = await DB.query('SELECT * FROM vendorprofile');
  return result.rows;
};

const addVendorFromAdmin = async (name, emailaddress1, contactnumber, url, city, filePath) => {
  const newObj = await DB.query(
    'INSERT INTO vendorprofile (name, emailaddress1,  contactnumber, url, city, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, emailaddress1, contactnumber, url, city, filePath]
  );
  return newObj.rows[0];
};

module.exports = {
  getAllVendorProfiles,
  addVendorFromAdmin,
  getVendorProfiles,
  addVendor,
  updateVendor,
  deleteVendor,
};