const { DB, s3 } = require("../../config");

const get = async (id) => {
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
       FROM activity
       WHERE vendorprofileid = ANY($1)`,
    [vendorProfileIds]
  );
  return result.rows;
};

const create = async (activity) => {
  const { name, description, categoryid, vendorprofileid } = activity;

  const query = `
      INSERT INTO activity(name, description, categoryid, vendorprofileid)
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `;

  const values = [name, description, categoryid, vendorprofileid];

  try {
    const res = await DB.query(query, values);
    return res.rows[0];
  } catch (err) {
    throw err;
  }
};

const update = async (
  name,
  description,
  inventorytype,
  categoryid,
  vendorprofileid,
  advertisedduration,
  advertisedprice,
  highlights,
  files,
  location,
  activityid
) => {
  let query = `
      UPDATE activity
      SET name = $1, description = $2, inventorytype = $3, categoryid = $4, vendorprofileid = $5, advertisedduration = $6, advertisedprice = $7, highlights = $8, location = $9
  `;

  let values = [
    name,
    description,
    inventorytype,
    categoryid,
    vendorprofileid,
    advertisedduration,
    advertisedprice,
    JSON.stringify(highlights),
    location
  ];

  let featuredImageUrl = "";

  if (files.featuredimage) {
    const file = files.featuredimage[0];
    const s3Response = await s3
      .upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `featured_${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
      })
      .promise();
    featuredImageUrl = s3Response.Location;
    query += `, featuredimage = $10`;
    values.push(featuredImageUrl);
  }

  if (files.gallery && files.gallery.length) {
    const galleryImageUrls = await Promise.all(files.gallery.map(async (file) => {
      const s3Response = await s3.upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `gallery_${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
      }).promise();
      return s3Response.Location;
    }));
  
    const galleryJson = JSON.stringify(galleryImageUrls);
    values.push(galleryJson); 
    query += `, gallery = $11`;
  }

  query += ` WHERE activityid = $${values.length + 1}`;

  values.push(activityid);

  await DB.query(query, values);
};

module.exports = {
  get,
  create,
  update,
};
