const { DB } = require('../../config');

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

const addPlatform = async (name, emailaddress1, contactnumber, url, city, filePath, userprofileid) => {
    await DB.query('BEGIN');

    try {
        const newObj = await DB.query(
            'INSERT INTO platformprofile (name, emailaddress1,  contactnumber, url, city, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, emailaddress1, contactnumber, url, city, filePath]
        );

        await DB.query('INSERT INTO platformuserprofile (platformid, userprofileid) VALUES ($1, $2) RETURNING *', [newObj.rows[0].platformid, userprofileid])

        await DB.query('COMMIT');

        return newObj.rows[0];

    } catch (err) {
        await DB.query('ROLLBACK');
        throw err;
    }
};

const updatePlatform = async (platformId, name, emailaddress1, contactnumber, url, city, image) => {
    let query = `
        UPDATE platformprofile
        SET name = $1, emailaddress1 = $2, contactnumber = $3, url = $4, city = $5
    `;

    let values = [name, emailaddress1, contactnumber, url, city];

    if (image != null) {
        query += `, image = $6`;
        values.push(image);
    }

    query += ` WHERE platformid = $${values.length + 1}`;

    values.push(platformId);

    await DB.query(query, values);
};

const deletePlatform = async (id) => {
    await DB.query('DELETE FROM platformuserprofile WHERE platformid = $1', [id]);
    const result = await DB.query('DELETE FROM platformprofile WHERE platformid = $1', [id]);
    return result.rowCount;
}

const whitelistVendor = async (id) => {
    await DB.query('INSERT INTO vendorplatformmapping (platforms, vendorid) VALUES ($1, $2) RETURNING *', [newObj.rows[0].platformid, userprofileid])
    return newObj.rows[0];
}

// For admin
const getAllPlatformProfiles = async () => {
    const result = await DB.query('SELECT * FROM platformprofile');
    return result.rows;
};

const addPlatformFromAdmin = async (name, emailaddress1, contactnumber, url, city, filePath) => {
    const newObj = await DB.query(
        'INSERT INTO platformprofile (name, emailaddress1, contactnumber, url, city, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, emailaddress1, contactnumber, url, city, filePath]
    );
    return newObj.rows[0];
};

module.exports = {
    getAllPlatformProfiles,
    addPlatformFromAdmin,
    getPlatformProfiles,
    addPlatform,
    updatePlatform,
    deletePlatform,
    whitelistVendor
};