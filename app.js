require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const firebase = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json')
const { s3 } = require('./config');

//swagger
const swaggerUI = require("swagger-ui-express");
let swaggerDocument = require('./swagger-config.json');

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Morgan setup for logging requests
app.use(morgan('dev'));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Custom middleware for response logging
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    // console.log("Response:", data); // log the response body
    originalSend.call(this, data);
  };
  next();
});

// Initialize Firebase Admin SDK
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

// Import routes
const routes = require('./src/routes');
app.use("/uploads", express.static("uploads"))
app.use('/api', routes);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument))


app.get('/generate-signed-url', (req, res) => {
  const key = req.query.key; // Assuming the key is provided as a query parameter

  const url = s3.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  res.send({ url });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});