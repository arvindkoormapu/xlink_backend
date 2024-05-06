const firebase = require('firebase-admin');
const { DB } = require('./config');

const checkAuth = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  try {
   // Verify Firebase ID token
   const decodedToken = await firebase.auth().verifyIdToken(token);
   const firebaseUID = decodedToken.uid;

   // Fetch user from your database using the firebaseUID
   const user = await DB.query(`SELECT * FROM userprofile WHERE externaluserid = '${firebaseUID}'`);
   
   if (user.rows.length === 0) {
     return res.status(404).send('User not found');
   }

   // Set user data in request object
   req.user = user.rows[0];
   next();
  } catch (error) {
    res.status(403).send('Invalid token');
  }
};

module.exports = checkAuth;