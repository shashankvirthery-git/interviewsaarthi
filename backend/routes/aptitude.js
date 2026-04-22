const express = require('express');
const router = express.Router();
const { generateAptitude } = require('../controllers/aptitudeController');

router.get('/generate', generateAptitude);

module.exports = router;