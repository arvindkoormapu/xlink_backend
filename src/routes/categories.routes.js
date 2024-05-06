const express = require('express');
const router = express.Router();
const { DB } = require('../../config');

router.get('/', async (req, res) => {
    try {
      const result = await DB.query('SELECT * FROM categories');
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

module.exports = router;