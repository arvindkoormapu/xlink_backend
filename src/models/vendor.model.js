const { DB, s3 } = require("../../config");

const getVendorProfiles = async (id) => {
  const result = await DB.query(
    `SELECT vup.*, vp.*
     FROM vendoruserprofile vup
     JOIN vendorprofile vp ON vup.vendorid = vp.vendorid
     WHERE vup.userprofileid = $1
     ORDER BY vup.vendorid DESC`,
    [id]
  );
  return result.rows;
};

const addVendor = async (
  name,
  emailaddress1,
  emailaddress2,
  contactnumber,
  officenumber,
  url,
  city,
  area,
  street,
  building,
  zipcode,
  file,
  userprofileid
) => {
  await DB.query("BEGIN");
  let imageUrl = null
  if (file) {
    const s3Response = await s3
      .upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `featured_${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();
    imageUrl = s3Response.Location;
  }

  try {
    const newObj = await DB.query(
      "INSERT INTO vendorprofile ( name, emailaddress1, emailaddress2, contactnumber, officenumber, url, city, area, street, building, zipcode, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
      [
        name,
        emailaddress1,
        emailaddress2,
        contactnumber,
        officenumber,
        url,
        city,
        area,
        street,
        building,
        zipcode,
        imageUrl,
      ]
    );

    await DB.query(
      "INSERT INTO vendoruserprofile (vendorid, userprofileid) VALUES ($1, $2) RETURNING *",
      [newObj.rows[0].vendorid, userprofileid]
    );

    await DB.query("COMMIT");

    return newObj.rows[0];
  } catch (err) {
    await DB.query("ROLLBACK");
    throw err;
  }
};

const updateVendor = async (
  vendorId,
  name,
  emailaddress1,
  emailaddress2,
  contactnumber,
  officenumber,
  url,
  city,
  area,
  street,
  building,
  zipcode,
  files
) => {
  let query = `
    UPDATE vendorprofile
    SET name = $1, emailaddress1 = $2, emailaddress2 = $3, contactnumber = $4, officenumber = $5, url = $6 , city = $7, area = $8, street = $9, building = $10, zipcode = $11
  `;

  let values = [
    name,
    emailaddress1,
    emailaddress2,
    contactnumber,
    officenumber,
    url,
    city,
    area,
    street,
    building,
    zipcode,
  ];

  if (files && files.featuredimage && files.featuredimage.length > 0) {
    const file = files.featuredimage[0];
    try {
      const s3Response = await s3.upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `featured_${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
      }).promise();
      
      query += `, image = $12`;
      values.push(s3Response.Location);
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  query += ` WHERE vendorid = $${values.length + 1} RETURNING *;`;

  values.push(vendorId);

  const newObj = await DB.query(query, values);
  return newObj.rows[0];
};

const deleteVendor = async (id) => {
  await DB.query("DELETE FROM vendoruserprofile WHERE vendorid = $1", [id]);
  const result = await DB.query(
    "DELETE FROM vendorprofile WHERE vendorid = $1",
    [id]
  );
  return result.rowCount;
};

// For admin
const getAllVendorProfiles = async () => {
  const result = await DB.query("SELECT * FROM vendorprofile");
  return result.rows;
};

const addVendorFromAdmin = async (
  name,
  emailaddress1,
  emailaddress2,
  contactnumber,
  officenumber,
  url,
  city,
  area,
  street,
  building,
  zipcode,
  filePath
) => {
  const newObj = await DB.query(
    "INSERT INTO vendorprofile (name, emailaddress1, emailaddress2, contactnumber, officenumber, url, city, area, street, building, zipcode, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
    [
      name,
      emailaddress1,
      emailaddress2,
      contactnumber,
      officenumber,
      url,
      city,
      area,
      street,
      building,
      zipcode,
      filePath,
    ]
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
