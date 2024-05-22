const { DB } = require("../../config");

const getPlatformProfiles = async (id) => {
  const result = await DB.query(
    `SELECT pup.*, pp.*
       FROM platformuserprofile pup
       JOIN platformprofile pp ON pup.platformid = pp.platformid
       WHERE pup.userprofileid = $1`,
    [id]
  );
  return result.rows;
};

const getPlatformProfile = async (id) => {
  const result = await DB.query(
    `SELECT *
       FROM platformprofile 
       WHERE platformid = $1`,
    [id]
  );
  return result.rows;
};

const addPlatform = async (
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
  let imageUrl = null;
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
      "INSERT INTO platformprofile ( name, emailaddress1, emailaddress2, contactnumber, officenumber, url, city, area, street, building, zipcode, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
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
      "INSERT INTO platformuserprofile (platformid, userprofileid) VALUES ($1, $2) RETURNING *",
      [newObj.rows[0].platformid, userprofileid]
    );

    await DB.query("COMMIT");

    return newObj.rows[0];
  } catch (err) {
    await DB.query("ROLLBACK");
    throw err;
  }
};

const updatePlatform = async (
  platformId,
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
        UPDATE platformprofile
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

  query += ` WHERE platformid = $${values.length + 1} RETURNING *;`;

  values.push(platformId);

  await DB.query(query, values);
};

const deletePlatform = async (id) => {
  await DB.query("DELETE FROM platformuserprofile WHERE platformid = $1", [id]);
  const result = await DB.query(
    "DELETE FROM platformprofile WHERE platformid = $1",
    [id]
  );
  return result.rowCount;
};

const whitelistVendor = async (platformId, vendorId) => {
  const query = `
    INSERT INTO platform_vendor_mapping (platform_id, vendor_id)
    VALUES ($1, $2::jsonb)
    ON CONFLICT (platform_id)
    DO UPDATE SET vendor_id = EXCLUDED.vendor_id;
  `;

  const values = [platformId, JSON.stringify(vendorId)];

  try {
    const res = await DB.query(query, values);
    return res;
  } catch (err) {
    throw new Error('Error executing upsert: ' + err.message);
  }
};

const getWhitelistVendor = async (id) => {
  const result = await DB.query(
    `SELECT *
       FROM platform_vendor_mapping 
       WHERE platform_id = $1`,
    [id]
  );
  return result.rows;
};

// For admin
const getAllPlatformProfiles = async () => {
  const result = await DB.query("SELECT * FROM platformprofile");
  return result.rows;
};

const addPlatformFromAdmin = async (
  name,
  emailaddress1,
  contactnumber,
  url,
  city,
  filePath
) => {
  const newObj = await DB.query(
    "INSERT INTO platformprofile (name, emailaddress1, contactnumber, url, city, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [name, emailaddress1, contactnumber, url, city, filePath]
  );
  return newObj.rows[0];
};

module.exports = {
  getAllPlatformProfiles,
  addPlatformFromAdmin,
  getPlatformProfiles,
  getPlatformProfile,
  addPlatform,
  updatePlatform,
  deletePlatform,
  whitelistVendor,
  getWhitelistVendor
};
