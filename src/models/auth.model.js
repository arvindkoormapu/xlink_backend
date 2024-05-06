const { DB } = require('../../config');

const getUserProfile = async (externaluserid) => {
    try {
        const result = await DB.query('SELECT * FROM userprofile WHERE externaluserid = $1', [externaluserid]);
       return result.rows[0]
    } catch (err) {
        throw err;
    }
    
};

module.exports = {
    getUserProfile,
};