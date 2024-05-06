const firebase = require('firebase-admin');
const AuthModel = require('../models/auth.model');

const login = async (req, res) => {
    const idToken = req.body.idToken;

    try {
        const decodedToken = await firebase.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const user = await AuthModel.getUserProfile(uid)

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const signup = async (req, res) => {
    const { email, password } = req.body;

    firebase.auth().createUser({
        email: email,
        password: password
    })
        .then(userRecord => {
            console.log('Successfully created new user:', userRecord.uid);

            res.status(201).send('User created successfully');
        })
        .catch(error => {
            console.log('Error creating new user:', error);
            res.status(500).send('Error creating user');
        });
};

module.exports = {
    login,
    signup
};