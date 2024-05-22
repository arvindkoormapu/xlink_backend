const { DB, s3 } = require("../../config");

const get = async (id) => {
  const result = await DB.query(
    `SELECT *
       FROM package
       WHERE activityid = $1`,
    [id]
  );
  return result.rows;
};

const create = async (package) => {
  const {
    packagename,
    packagedescription,
    pricestartsfrom,
    included,
    notincluded,
    duration,
    termsandcondition,
    activityid,
  } = package;

  const query = `
      INSERT INTO package(packagename, packagedescription, pricestartsfrom, included,
        notincluded,
        duration,
        termsandcondition, activityid)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

  const values = [
    packagename,
    packagedescription,
    pricestartsfrom,
    included,
    notincluded,
    duration,
    termsandcondition,
    activityid,
  ];

  try {
    const res = await DB.query(query, values);
    return res.rows[0];
  } catch (err) {
    throw err;
  }
};

const update = async (
  id,
  packagename,
  packagedescription,
  pricestartsfrom,
  isenabled,
  included,
  notincluded,
  duration,
  termsandcondition,
  files
) => {
  let query = `
              UPDATE package
              SET packagename = $1, packagedescription = $2, pricestartsfrom = $3, isenabled = $4, included = $5,
              notincluded = $6,
              duration = $7,
              termsandcondition = $8
          `;
  let values = [
    packagename,
    packagedescription,
    pricestartsfrom,
    isenabled,
    included,
    notincluded,
    duration,
    termsandcondition
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
    query += `, featuredimage = $9`;
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
    query += `, gallery = $10`;
  }

  query += ` WHERE packageid = $${values.length + 1}`;

  values.push(id);

  await DB.query(query, values);
};

const deletePackage = async (packageid) => {
  const client = await DB.connect();

  try {
    await client.query('BEGIN');

    // Delete from sessions
    const deleteSessionsQuery = `
      DELETE FROM sessions
      USING schedules
      WHERE sessions.scheduleid = schedules.scheduleid
        AND schedules.packageid = $1;
    `;
    await client.query(deleteSessionsQuery, [packageid]);

    // Delete from schedules
    const deleteSchedulesQuery = `
      DELETE FROM schedules
      WHERE packageid = $1;
    `;
    await client.query(deleteSchedulesQuery, [packageid]);

    // Delete from package
    const deletePackageQuery = `
      DELETE FROM package
      WHERE packageid = $1;
    `;
    await client.query(deletePackageQuery, [packageid]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

module.exports = {
  get,
  create,
  update,
  deletePackage
};
