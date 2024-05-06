const { DB } = require("../../config");
const crypto = require("crypto");

const generateApiKey = () => {
  return crypto.randomBytes(16).toString("hex"); // Generates a 32-character hex string
};

const generateSecret = (length) => {
  let numericSecret = '';
  while (numericSecret.length < length) {
    // Generate a random byte
    const byte = crypto.randomBytes(1).readUInt8(0);

    // Convert the byte to a string in the decimal range (0-9)
    numericSecret += byte % 10;
  }

  // Trim the string to the desired length
  return numericSecret.substring(0, length);
}

const getPlatformApiKeys = async (id) => {
  const result = await DB.query(
    `SELECT *
     FROM platformAPIKeys
     WHERE userprofileid = $1`,
    [id]
  );
  return result.rows;
};

const addPlatformApiKey = async (
  name,
  whitelisted_ips,
  description,
  userprofileid
) => {
  const newObj = await DB.query(
    "INSERT INTO platformAPIKeys (name, apikey, secret, whitelisted_ips, description, active, userprofileid, seen, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *",
    [
      name,
      generateApiKey(),
      generateSecret(16),
      JSON.stringify(whitelisted_ips),
      description,
      true,
      userprofileid,
      false
    ]
  );

  return newObj.rows[0];
};

const updateSeenState = async (id) => {
  const result = await DB.query(
    `UPDATE platformAPIKeys
     SET seen = true
     WHERE id = $1`,
    [id]
  );
  return result.rows;
};

const updateActiveState = async (active, id) => {
  const result = await DB.query(
    `UPDATE platformAPIKeys
       SET active = $1
       WHERE id = $2`,
    [active, id]
  );
  return result.rows;
};

module.exports = {
  getPlatformApiKeys,
  addPlatformApiKey,
  updateSeenState,
  updateActiveState,
};
