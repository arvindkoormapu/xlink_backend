const { DB, UserRole } = require('../../config');
const firebase = require('firebase-admin');

const getUserProfiles = async () => {
  const result = await DB.query(`
  SELECT 
    userprofile.*, 
    ARRAY_AGG(ROW_TO_JSON(vendorprofile.*)) FILTER (WHERE vendorprofile.vendorid IS NOT NULL) AS profiles,
    ARRAY_AGG(ROW_TO_JSON(platformprofile.*)) FILTER (WHERE platformprofile.platformid IS NOT NULL) AS profiles
FROM 
    userprofile 
LEFT JOIN 
    vendoruserprofile ON userprofile.userprofileid = vendoruserprofile.userprofileid 
LEFT JOIN 
    vendorprofile ON vendoruserprofile.vendorid = vendorprofile.vendorid 
LEFT JOIN 
    platformuserprofile ON userprofile.userprofileid = platformuserprofile.userprofileid 
LEFT JOIN 
    platformprofile ON platformuserprofile.platformid = platformprofile.platformid 
WHERE 
    userprofile.roleid != ${UserRole.ADMIN}
GROUP BY 
    userprofile.userprofileid`);
  return result.rows;
};

const addUserProfile = async (email, password, userRole, profileids) => {
  let role
  if (userRole == 'VENDOR') role = UserRole.VENDOR
  if (userRole == 'PLATFORM') role = UserRole.PLATFORM

  await DB.query('BEGIN');
  try {
    const userRecord = await firebase.auth().createUser({
      email: email,
      password: password
    })

    const newObj = await DB.query(
      'INSERT INTO userprofile (email, roleid, externaluserid) VALUES ($1, $2, $3) RETURNING *',
      [email, role, userRecord.uid]
    );

    const userprofileid = newObj.rows[0].userprofileid

    if (userRole == 'VENDOR') {
      // insert to vendoruserprofile
      // preparing an array as in vendoruserprofile table
      const combinedArray = await profileids.reduce((accumulator, current) => {
        accumulator.push({ 'vendorid': current, 'userprofileid': userprofileid });
        return accumulator;
      }, []);

      const queryText = 'INSERT INTO vendoruserprofile (vendorid, userprofileid) VALUES ';
      const valueStrings = combinedArray.map((_, i) => `($${2 * i + 1}, $${2 * i + 2})`).join(', ');
      const finalQuery = queryText + valueStrings;
      const flattenedValues = combinedArray.reduce((acc, val) => acc.concat([val.vendorid, val.userprofileid]), []);

      await DB.query(finalQuery, flattenedValues);
    }
    if (userRole == 'PLATFORM') {
      // insert to platformuserprofile
      // preparing an array as in platformuserprofile table
      const combinedArray = await profileids.reduce((accumulator, current) => {
        accumulator.push({ 'platformid': current, 'userprofileid': userprofileid });
        return accumulator;
      }, []);

      const queryText = 'INSERT INTO platformuserprofile (platformid, userprofileid) VALUES ';
      const valueStrings = combinedArray.map((_, i) => `($${2 * i + 1}, $${2 * i + 2})`).join(', ');
      const finalQuery = queryText + valueStrings;
      const flattenedValues = combinedArray.reduce((acc, val) => acc.concat([val.platformid, val.userprofileid]), []);

      await DB.query(finalQuery, flattenedValues);
    }

    await DB.query('COMMIT');

  } catch (err) {
    await DB.query('ROLLBACK');
    throw err;
  }
};

const updateUserProfile = async (userprofileid, userRole, profileids) => {
  let role, data
  if (userRole == 'VENDOR') role = UserRole.VENDOR
  if (userRole == 'PLATFORM') role = UserRole.PLATFORM

  await DB.query('BEGIN');

  try {
    if (userRole == 'VENDOR') {
      role = UserRole.VENDOR
      data = await profileids.reduce((accumulator, current) => {
        accumulator.push({ 'vendorid': current, 'userprofileid': userprofileid });
        return accumulator;
      }, []);

      // Delete all records related to userprofileid
      await DB.query('DELETE FROM vendoruserprofile WHERE userprofileid = $1', [userprofileid]);

      // Insert new records
      const queryText = 'INSERT INTO vendoruserprofile (vendorid, userprofileid) VALUES ';
      const valueStrings = data.map((_, i) => `($${2 * i + 1}, $${2 * i + 2})`).join(', ');
      const finalQuery = queryText + valueStrings;
      const flattenedValues = data.reduce((acc, val) => acc.concat([val.vendorid, val.userprofileid]), []);

      await DB.query(finalQuery, flattenedValues);
    }

    if (userRole == 'PLATFORM') {
      role = UserRole.PLATFORM
      data = await profileids.reduce((accumulator, current) => {
        accumulator.push({ 'platformid': current, 'userprofileid': userprofileid });
        return accumulator;
      }, []);

      // Delete all records related to userprofileid
      await DB.query('DELETE FROM platformuserprofile WHERE userprofileid = $1', [userprofileid]);

      // Insert new records
      const queryText = 'INSERT INTO platformuserprofile (platformid, userprofileid) VALUES ';
      const valueStrings = data.map((_, i) => `($${2 * i + 1}, $${2 * i + 2})`).join(', ');
      const finalQuery = queryText + valueStrings;
      const flattenedValues = data.reduce((acc, val) => acc.concat([val.platformid, val.userprofileid]), []);

      await DB.query(finalQuery, flattenedValues);
    }

    await DB.query('COMMIT');

  } catch (err) {
    await DB.query('ROLLBACK');
    throw err;
  }
};

const deleteUserProfile = async (id, userRole) => {

  await DB.query('BEGIN');

  try {
    if (userRole == 'VENDOR') {
      // First, delete referencing rows in vendoruserprofile
      await DB.query('DELETE FROM vendoruserprofile WHERE userprofileid = $1', [id]);

      // Then, delete the row in userprofile
      const result = await DB.query('DELETE FROM userprofile WHERE userprofileid = $1', [id]);
      await DB.query('COMMIT');

      return result.rowCount;
    }
    if (userRole == 'PLATFORM') {
      await DB.query('DELETE FROM platformuserprofile WHERE userprofileid = $1', [id]);

      const result = await DB.query('DELETE FROM userprofile WHERE userprofileid = $1', [id]);

      await DB.query('COMMIT');

      return result.rowCount;
    }
  } catch (err) {
    await DB.query('ROLLBACK');
    throw err;
  }
}

module.exports = {
  getUserProfiles,
  addUserProfile,
  updateUserProfile,
  deleteUserProfile
};