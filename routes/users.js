var express = require('express');
const { generatePdf } = require('../controllers/pdf-genrate');
var router = express.Router();

/* GET users listing. */
router.get('/will', generatePdf);

module.exports = router;
