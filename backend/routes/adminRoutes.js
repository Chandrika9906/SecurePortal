const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, contentController.getAdminStats);

module.exports = router;
