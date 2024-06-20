const express = require('express');
const contactController = require('../controllers/contactController');

const router = express.Router();


router.post('/identify', contactController.processContacts);

module.exports = router;